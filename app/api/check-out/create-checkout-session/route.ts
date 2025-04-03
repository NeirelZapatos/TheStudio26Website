import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient, ObjectId } from 'mongodb';
import Customer from '@/app/models/Customer';
import Subscription from '@/app/models/Subscription';
import mongoose, { Types } from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Define cart item interface
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  description?: string;
  isSubscription?: boolean;
  interval?: 'day' | 'week' | 'month' | 'year';
  intervalCount?: number;
  type?: 'lab' | 'item' | 'course' | 'subscription';
}

const uri = process.env.MONGODB_URI as string;
let client: MongoClient | null = null;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");
  }
  return client;
}

export async function POST(request: Request) {
  try {
    const { cartItems, customerEmail, firstName, lastName } = await request.json(); // Array of item ID's to checkout

    // * Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    await connectToDatabase();

    // Find or initialize customer
    let customer = await Customer.findOne({ email: customerEmail });

    let stripeCustomerId: string | null = null;

    // * Check if any subscription products
    const hasSubscriptions = cartItems.some((item: CartItem) => item.isSubscription);

    if (hasSubscriptions) {
      // ! For subscriptions, we need a Stripe customer
      if (customer && customer.stripe_customer_id) {
        stripeCustomerId = customer.stripe_customer_id;
      } else {
        // * Create a new Stripe customer
        const stripeCustomer = await stripe.customers.create({
          email: customerEmail,
          name: `${firstName} ${lastName}`,
        });

        stripeCustomerId = stripeCustomer.id;

        // * Save or update customer in database
        if (customer) {
          customer.stripe_customer_id = stripeCustomerId;
          await customer.save();
        } else {
          customer = new Customer({
            email: customerEmail,
            first_name: firstName,
            last_name: lastName,
            stripe_customer_id: stripeCustomerId,
            orders: [],
            courses: [],
          });
          await customer.save();
        }
      }
    }

    // * Separate cart items by type
    const labItems: CartItem[] = [];
    const courseItems: CartItem[] = [];
    const regularItems: CartItem[] = [];
    const subscriptionItems: CartItem[] = [];

    // * Categorize items and validate against database
    const labIds: Types.ObjectId[] = [];
    const courseIds: Types.ObjectId[] = [];
    const itemIds: Types.ObjectId[] = [];
    const subscriptionIds: Types.ObjectId[] = [];

    // * Process and categorize all cart items
    for (const item of cartItems) {
      if (item.isSubscription) {
        subscriptionItems.push(item);
        subscriptionIds.push(new mongoose.Types.ObjectId(item.productId));
      } else if (item.type === 'lab') {
        labItems.push(item);
        labIds.push(new mongoose.Types.ObjectId(item.productId));
      } else if (item.type === 'course') {
        courseItems.push(item);
        courseIds.push(new mongoose.Types.ObjectId(item.productId));
      } else {
        regularItems.push(item);
        itemIds.push(new mongoose.Types.ObjectId(item.productId));
      }
    }

    // * Check for subscription products and fetch their Stripe price IDs
    let subscriptionProducts = [];
    if (subscriptionItems.length > 0) {
      subscriptionProducts = await Subscription.find({
        _id: { $in: subscriptionIds },
        active: true,
      });
    }

    // * Create line items for Stripe
    const lineItems: any[] = [];

    // * Create line items for labs, courses, and regular items
    cartItems.forEach((product: CartItem) => {
      if (product.isSubscription) {
        // ! For subscription items, find the matching subscription product 
        const subscriptionProduct = subscriptionProducts.find(
          (p) => p._id.toString() === product.productId
        );

        if (subscriptionProduct && subscriptionProduct.stripePriceId) {
          // * For subscription items, we use the price ID directly
          lineItems.push({
            price: subscriptionProduct.stripePriceId,
            quantity: 1, // ! Subscriptions always have quantity of 1
          });
        }
      } else {
        // ! For non-subscription items, create a price on the fly
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description || '',
              images: [product.image_url],
              metadata: {
                productId: product.productId,
                type: product.type || 'item',
              },
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: product.quantity,
        });
      }
    });

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // * Determine checkout mode based on cart contents
    const checkoutMode = hasSubscriptions ? 'subscription' : 'payment';

    // * Create a checkout session with the appropriate mode
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: checkoutMode as Stripe.Checkout.SessionCreateParams.Mode,
      success_url: `${origin}/check-out/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/check-out`,
      billing_address_collection: 'required',
      metadata: {
        customerId: customer ? customer._id.toString() : '',
        customerEmail,
        firstName,
        lastName,
        labIds: JSON.stringify(labIds.map(id => id.toString())),
        courseIds: JSON.stringify(courseIds.map(id => id.toString())),
        itemIds: JSON.stringify(itemIds.map(id => id.toString())),
        subscriptionIds: JSON.stringify(subscriptionIds.map(id => id.toString())),
        checkoutMode,
      },
    };

    // ! Add shipping address collection for physical items
    if (regularItems.length > 0) {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['US'],
      };
    }

    // ! Add customer ID if it exists (required for subscriptions)
    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("Checkout Session ID:", session.id);
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
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    console.log("Processing order for session ID:", sessionId);

    const dbClient = await connectToDatabase();
    const db = dbClient.db("test");
    const ordersCollection = db.collection("orders");
    const customersCollection = db.collection("customers");

    // * Check if order already exists for this session
    const existingOrder = await ordersCollection.findOne({ stripe_session_id: sessionId });
    if (existingOrder) {
      console.log("Order already exists for session:", sessionId);
      return NextResponse.json({
        success: true,
        orderId: existingOrder._id.toString(),
        message: "Order already processed"
      });
    }

    // * Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });

    console.log("Retrieved Stripe session, payment status:", session.payment_status);

    // * Get product and course IDs from metadata
    const mongoItemIds = session.metadata?.mongoItemIds ? JSON.parse(session.metadata.mongoItemIds) : [];
    const mongoCourseIds = session.metadata?.mongoCourseIds ? JSON.parse(session.metadata.mongoCourseIds) : [];
    const mongoSubscriptionIds = session.metadata?.mongoSubscriptionIds ? JSON.parse(session.metadata.mongoSubscriptionIds) : [];

    const checkoutMode = session.metadata?.checkoutMode || 'payment';

    // ! For subscription-only checkouts don't need to create an order -> handled by webhooks
    if (checkoutMode === 'subscription' && mongoItemIds.length === 0 && mongoCourseIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Subscription processed via webhooks",
        isSubscription: true
      });
    }

    if (mongoItemIds.length === 0 && mongoCourseIds.length === 0) {
      return NextResponse.json({ error: "No items or courses found" }, { status: 400 });
    }

    const verifiedEmail = session.customer_details?.email || session.metadata?.tempCustomerEmail;

    if (!verifiedEmail) {
      return NextResponse.json({ error: "Customer email not found" }, { status: 400 })
    }

    let customer = await customersCollection.findOne({ email: verifiedEmail });

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
            updatedAt: new Date()
          }
        }
      );
      console.log("Updated existing customer with ID:", customer._id.toString());
    } else {
      const newCustomer = {
        email: verifiedEmail,
        first_name: firstName,
        last_name: lastName,
        orders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await customersCollection.insertOne(newCustomer);
      customer = await customersCollection.findOne({ _id: result.insertedId });
      console.log("Created new customer with ID:", result.insertedId.toString());
    }

    if (!customer) {
      return NextResponse.json({ error: "Customer ID not found in session metadata" }, { status: 400 });
    }

    // * Convert string Id's to object id's
    const itemProducts = mongoItemIds.map((id: string) => new ObjectId(id));
    const courseProducts = mongoCourseIds.map((id: string) => new ObjectId(id));

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

    const shippingAddress = formatAddress(session.shipping_details?.address);
    const billingAddress = formatAddress(session.customer_details?.address);

    const orderData = {
      stripe_session_id: sessionId,
      customer_id: new ObjectId(customer._id),
      product_items: itemProducts,
      course_items: courseProducts,
      has_subscription_items: mongoSubscriptionIds.length > 0,
      order_date: new Date(),
      total_amount: totalAmount,
      shipping_method: "Standard",
      payment_method: session.payment_method_types[0],
      payment_status: session.payment_status || 'unknown',
      order_status: "pending",
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      customer_email: session.customer_details?.email || "",
      shipping_id: null,
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
      message: "Order successfully processed and saved"
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