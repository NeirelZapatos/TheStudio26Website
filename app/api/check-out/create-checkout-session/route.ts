import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient, ObjectId } from 'mongodb';
import Customer from '@/app/models/Customer';
import Subscription from '@/app/models/Subscription';
import mongoose, { Types } from 'mongoose';

const uri = process.env.MONGODB_URI as string;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Define cart item interface
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  description?: string;
  type?: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  deliveryMethod: 'pickup' | 'delivery';
}

async function connectToDatabase() {
  try {
    // For mongoose models
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
      console.log("Connected to MongoDB with mongoose");
    }

    // For direct MongoDB operations
    const client = new MongoClient(uri);
    await client.connect();

    // Get database name from the connection
    const dbName = client.db().databaseName;
    console.log(`Using database: ${dbName}`);

    return { client, dbName };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { cartItems, customerInfo } = await request.json();
    const { firstName, lastName, email, phone, deliveryMethod } = customerInfo as CustomerInfo;

    // * Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // * Filter out any lab or course items that might have been sent
    const filteredCartItems = cartItems.filter((item: CartItem) =>
      item.type !== 'lab' && item.type !== 'course'
    );

    if (filteredCartItems.length === 0) {
      return NextResponse.json({ error: "No valid items in cart after filtering" }, { status: 400 });
    }

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: "Either email or phone number is required" }, { status: 400 });
    }

    // * Validate delivery method
    if (!deliveryMethod || (deliveryMethod !== 'pickup' && deliveryMethod !== 'delivery')) {
      return NextResponse.json({ error: "Invalid delivery method" }, { status: 400 });
    }

    await connectToDatabase();

    let customer = null;

    if (email) {
      customer = await Customer.findOne({ email });
    } else if (phone) {
      customer = await Customer.findOne({ phone_number: phone });
    }

    // * Process items only 
    const regularItems: CartItem[] = filteredCartItems;
    const itemIds: Types.ObjectId[] = regularItems.map(item =>
      new mongoose.Types.ObjectId(item.productId)
    );

    // * Create line items for Stripe
    const lineItems = cartItems.map((product: CartItem) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
          description: product.description,
          images: product.image_url ? [product.image_url] : [],
          metadata: {
            productId: product.productId,
            type: product.type || 'item',
          },
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity,
    }));

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // * Create a checkout session with the appropriate mode
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/check-out/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/check-out`,
      billing_address_collection: 'required',
      metadata: {
        customerId: customer ? customer._id.toString() : '',
        firstName,
        lastName,
        deliveryMethod,
        ...(email && { email }),
        ...(phone && { phone_number: phone }),
        mongoItemIds: JSON.stringify(itemIds.map(id => id.toString())),
      },
    };

    // ! Add shipping address collection for physical items IF order is a deliery order
    if (deliveryMethod === 'delivery') {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['US'],
      };
    }

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("Checkout Session ID:", session.id, "Delivery Method:", deliveryMethod);
    return NextResponse.json({ id: session.id });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error creating Checkout Session:', err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    console.log("Processing order for session ID:", sessionId);

    const { client, dbName } = await connectToDatabase();
    const db = client.db(dbName);
    const ordersCollection = db.collection("orders");
    const customersCollection = db.collection("customers");

    // * Check if order already exists for this session
    const existingOrder = await ordersCollection.findOne({ stripe_session_id: sessionId });
    if (existingOrder) {
      console.log("Order already exists for session:", sessionId);
      return NextResponse.json({
        success: true,
        orderId: existingOrder._id.toString(),
        message: "Order already processed",
        session: {
          id: sessionId,
          customer_details: {
            email: existingOrder.customer_email,
            name: `${existingOrder.first_name} ${existingOrder.last_name}`,
          },
          amount_total: existingOrder.total_amount * 100,
          payment_status: existingOrder.payment_status,
        }
      });
    }

    // * Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });

    console.log("Retrieved Stripe session, payment status:", session.payment_status);

    // * Get product and course IDs from metadata
    const mongoItemIds = session.metadata?.mongoItemIds ? JSON.parse(session.metadata.mongoItemIds) : [];

    const deliveryMethod = session.metadata?.deliveryMethod || 'delivery';

    if (mongoItemIds.length === 0) {
      return NextResponse.json({ error: "No items found" }, { status: 400 });
    }

    const verifiedEmail = session.customer_details?.email || session.metadata?.tempCustomerEmail;
    const verifiedPhone = session.customer_details?.phone || session.metadata?.phone_number;

    if (!verifiedEmail && !verifiedPhone) {
      return NextResponse.json({ error: "Customer contact info not found" }, { status: 400 })
    }

    let customerQuery = {};
    if (verifiedEmail) {
      customerQuery = { email: verifiedEmail };
    } else if (verifiedPhone) {
      customerQuery = { phone_number: verifiedPhone };
    }

    let customer = await customersCollection.findOne(customerQuery);

    const customerName = session.customer_details?.name?.split(" ") || [];
    const firstName = customerName[0] || session.metadata?.tempFirstName || "";
    const lastName = customerName.slice(1).join(" ") || session.metadata?.tempLastName || "";

    if (customer) {
      await customersCollection.updateOne(
        { _id: customer._id },
        {
          $set: {
            first_name: firstName,
            last_name: lastName,
            ...(verifiedEmail && !customer.email ? { email: verifiedEmail } : {}),
            ...(verifiedPhone && !customer.phone_number ? { phone_number: verifiedPhone } : {}),
            updatedAt: new Date()
          }
        }
      );
      console.log("Updated existing customer with ID:", customer._id.toString());
    } else {
      const newCustomer = {
        ...(verifiedEmail ? { email: verifiedEmail } : {}),
        ...(verifiedPhone ? { phone_number: verifiedPhone } : {}),
        first_name: firstName,
        last_name: lastName,
        orders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        const result = await customersCollection.insertOne(newCustomer);
        customer = await customersCollection.findOne({ _id: result.insertedId });
        console.log("Created new customer with ID:", result.insertedId.toString());
      } catch (error) {
        if (error instanceof Error && (error as any).code === 11000) {
          customer = await customersCollection.findOne({
            $or: [
              { email: verifiedEmail },
              { phone: verifiedPhone }
            ]
          });
        } else {
          throw error; // Rethrow if it's not a duplicate key error
        }
      }
    }

    if (!customer) {
      return NextResponse.json({ error: "Customer ID not found in session metadata" }, { status: 400 });
    }

    // * Convert string Id's to object id's
    const itemProducts = mongoItemIds.map((id: string) => new ObjectId(id));

    const totalAmount = session.amount_total ? session.amount_total / 100 : 0; // Convert back to dollars

    const formatAddress = (address: any) => {
      if (!address) return "No address provided";
      const addressParts = [
        address.line1,
        address.line2 || null,
        address.city,
        address.state,
        address.postal_code,
        address.country
      ].filter(Boolean);
      return addressParts.join(", ");
    };

    const shippingAddress = deliveryMethod === 'delivery' ? formatAddress(session.shipping_details?.address) : "";
    const billingAddress = formatAddress(session.customer_details?.address);

    const orderData = {
      stripe_session_id: sessionId,
      customer_id: new ObjectId(customer._id),
      product_items: itemProducts,
      order_date: new Date(),
      total_amount: totalAmount,
      delivery_method: deliveryMethod, // ! Addded for delivery orders
      shipping_method: "Standard",
      payment_method: session.payment_method_types[0],
      payment_status: session.payment_status || 'unknown',
      order_status: "pending",
      shipping_address: shippingAddress, // ! Will return empty if pickup order
      billing_address: billingAddress,
      customer_email: session.customer_details?.email || "",
      shipping_id: null,
      is_pickup: deliveryMethod === 'pickup',
      updatedAt: new Date(),
    };

    const orderResult = await ordersCollection.insertOne(orderData);
    const orderId = orderResult.insertedId;

    // * Update customer with order(s)
    await customersCollection.updateOne(
      { _id: new ObjectId(customer._id) },
      {
        $addToSet: { orders: orderId.toString() },
        $set: { updatedAt: new Date() }
      }
    );

    console.log("Order saved to MongoDB:", orderId.toString());

    return NextResponse.json({
      success: true,
      orderId: orderId.toString(),
      deliveryMethod,
      message: "Order successfully processed and saved",
      session: {
        id: session.id,
        amount_total: session.amount_total,
        customer_details: session.customer_details,
        payment_status: session.payment_status,
      }
    });
  } catch (err: unknown) {
    console.error('Error in GET handler:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}