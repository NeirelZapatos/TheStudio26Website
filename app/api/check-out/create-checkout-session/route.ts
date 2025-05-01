import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient, ObjectId } from 'mongodb';
import Customer from '@/app/models/Customer';
import mongoose, { Types } from 'mongoose';
import { sendEmail } from '@/app/lib/mailer';

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

interface DBItem {
  _id: ObjectId;
  name: string;
  price: number;
  quantity_in_stock: number;
  description?: string;
  image_url?: string;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
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

// Check if items are in stock before proceeding with checkout
async function verifyItemsInStock(db: any, cartItems: CartItem[]): Promise<{
  success: boolean;
  insufficientItems?: Array<{
    productId: string;
    name: string;
    requestedQuantity: number;
    availableQuantity: number;
  }>;
}> {
  try {
    const itemsCollection = db.collection("items");

    // Fetch all items in one query
    const itemDocuments = await itemsCollection.find({
      _id: { $in: cartItems.map(item => new ObjectId(item.productId)) }
    }).toArray() as DBItem[];

    // Check if all items exist and have sufficient stock
    const itemsMap = new Map(itemDocuments.map(item => [item._id.toString(), item]));

    const insufficientItems = cartItems.filter(cartItem => {
      const dbItem = itemsMap.get(cartItem.productId);
      // Item doesn't exist or not enough quantity
      return !dbItem || dbItem.quantity_in_stock < cartItem.quantity;
    });

    if (insufficientItems.length > 0) {
      return {
        success: false,
        insufficientItems: insufficientItems.map(item => ({
          productId: item.productId,
          name: item.name,
          requestedQuantity: item.quantity,
          availableQuantity: itemsMap.get(item.productId)?.quantity_in_stock || 0
        }))
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error verifying stock:", error);
    throw error;
  }
}

// Helper function to decrement stock quantities
async function decrementStockQuantities(db: mongoose.mongo.Db, cartItems: any[]) {
  try {
    const itemsCollection = db.collection("items");

    // Create bulk operations for each item
    const bulkOps = cartItems.map((item: { productId: number; quantity: number; }) => ({
      updateOne: {
        // Only update if quantity_in_stock is greater than or equal to the requested quantity
        filter: {
          _id: new ObjectId(item.productId),
          quantity_in_stock: { $gte: item.quantity }
        },
        update: {
          $inc: { quantity_in_stock: -item.quantity },
          $set: { updatedAt: new Date() }
        }
      }
    }));

    if (bulkOps.length > 0) {
      const result = await itemsCollection.bulkWrite(bulkOps);
      console.log(`Stock quantities updated for ${result.modifiedCount} items`);

      // Check if all items were updated
      if (result.modifiedCount !== cartItems.length) {
        // Find which items didn't have enough stock
        const insufficientStockItems = await itemsCollection.find({
          _id: { $in: cartItems.map((item: { productId: number; }) => new ObjectId(item.productId)) },
          quantity_in_stock: { $lt: 0 }
        }).toArray();

        if (insufficientStockItems.length > 0) {
          throw new Error("Some items don't have enough stock");
        }
      }

      return result;
    }
    return null;
  } catch (error) {
    console.error("Error decrementing stock quantities:", error);
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

    const { client, dbName } = await connectToDatabase();
    const db = client.db(dbName);

    // * Verify stock availability before proceeding
    const stockVerification = await verifyItemsInStock(db, filteredCartItems);
    if (!stockVerification.success) {
      return NextResponse.json({
        error: "Some items are out of stock or have insufficient quantity",
        items: stockVerification.insufficientItems
      }, { status: 400 });
    }

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

    const origin = request.headers.get('origin') || 'http://localhost:3000' || process.env.NEXTAUTH_URL;

    // * Create a checkout session
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
        cartItems: JSON.stringify(cartItems.map((item: { productId: any; quantity: any; name: any; price: any; }) => ({
          productId: item.productId,
          quantity: item.quantity,
          name: item.name,
          price: item.price
        }))),
      },
      automatic_tax: { enabled: true },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes expiration
    };

    // ! Add shipping address collection for physical items IF order is a deliery order
    if (deliveryMethod === 'delivery') {
      sessionParams.shipping_address_collection = {
        allowed_countries: ['US'],
      };

      sessionParams.shipping_options = [
        {
          shipping_rate: process.env.STRIPE_STANDARD_SHIPPING_RATE,
        }
      ];
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
    const itemsCollection = db.collection("items");

    // * Check if order already exists for this session
    const existingOrder = await ordersCollection.findOne({ stripe_session_id: sessionId });

    if (existingOrder) {
      console.log("Order already exists for session:", sessionId);

      const deliveryMethod = existingOrder.delivery_method || (existingOrder.is_pickup ? 'pickup' : 'delivery');

      let formattedShippingAddress = undefined;
      if (existingOrder.shipping_address && deliveryMethod === 'delivery') {
        const addressParts = existingOrder.shipping_address.split(", ");
        formattedShippingAddress = {
          line1: addressParts[0] || "",
          ...(addressParts.length > 4 && { line2: addressParts[1] || "" }),
          city: addressParts.length > 4 ? addressParts[2] || "" : addressParts[1] || "",
          state: addressParts.length > 4 ? addressParts[3].split(" ")[0] || "" : addressParts[2].split(" ")[0] || "",
          postal_code: addressParts.length > 4 ? addressParts[3].split(" ")[1] || "" : addressParts[2].split(" ")[1] || "",
          country: addressParts[addressParts.length - 1] || ""
        };
      }

      let formattedBillingAddress = undefined;
      if (existingOrder.billing_address) {
        const addressParts = existingOrder.billing_address.split(", ");
        formattedBillingAddress = {
          line1: addressParts[0] || "",
          ...(addressParts.length > 4 && { line2: addressParts[1] || "" }),
          city: addressParts.length > 4 ? addressParts[2] || "" : addressParts[1] || "",
          state: addressParts.length > 4 ? addressParts[3].split(" ")[0] || "" : addressParts[2].split(" ")[0] || "",
          postal_code: addressParts.length > 4 ? addressParts[3].split(" ")[1] || "" : addressParts[2].split(" ")[1] || "",
          country: addressParts[addressParts.length - 1] || ""
        };
      }

      return NextResponse.json({
        success: true,
        orderId: existingOrder._id.toString(),
        deliveryMethod: deliveryMethod,
        message: "Order already processed",
        session: {
          id: sessionId,
          amount_total: existingOrder.total_amount * 100,
          customer_details: {
            email: existingOrder.customer_email || "",
            name: `${existingOrder.first_name || ''} ${existingOrder.last_name || ''}`.trim() || "",
            phone: existingOrder.phone_number || "",
            ...(formattedBillingAddress && { address: formattedBillingAddress })
          },
          ...(deliveryMethod === 'delivery' && formattedShippingAddress && {
            shipping_details: {
              address: formattedShippingAddress,
              name: `${existingOrder.first_name || ''} ${existingOrder.last_name || ''}`.trim() || ""
            }
          }),
          payment_status: existingOrder.payment_status,
        }
      });
    }

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details', 'total_details']
    });

    console.log("Retrieved Stripe session, payment status:", stripeSession.payment_status);

    // * Only continue if payment is completed
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 402 }
      );
    }

    const cartItems = stripeSession.metadata?.cartItems
      ? JSON.parse(stripeSession.metadata.cartItems)
      : [];

    if (stripeSession.payment_status === 'paid') {
      try {
        if (cartItems.length > 0) {
          // Verify stock before decrementing
          const outOfStockItems = await itemsCollection.find({
            _id: { $in: cartItems.map((i: { productId: number; }) => new ObjectId(i.productId)) },
            quantity_in_stock: { $lt: 1 }
          }).toArray();

          if (outOfStockItems.length > 0) {
            return NextResponse.json(
              { error: "Some items are out of stock", items: outOfStockItems },
              { status: 400 }
            );
          }

          // Proceed with decrement
          await decrementStockQuantities(db, cartItems);
        }
      } catch (error) {
        console.error("Stock update failed:", error);
        throw error; // This will prevent order creation
      }
    }

    // * Get product and course IDs from metadata
    const mongoItemIds = stripeSession.metadata?.mongoItemIds ? JSON.parse(stripeSession.metadata.mongoItemIds) : [];

    const deliveryMethod = stripeSession.metadata?.deliveryMethod || 'delivery';

    if (mongoItemIds.length === 0) {
      return NextResponse.json({ error: "No items found" }, { status: 400 });
    }

    const verifiedEmail = stripeSession.customer_details?.email || stripeSession.metadata?.email;
    const verifiedPhone = stripeSession.customer_details?.phone || stripeSession.metadata?.phone_number;

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

    const customerName = stripeSession.customer_details?.name?.split(" ") || [];
    const firstName = customerName[0] || stripeSession.metadata?.firstName || "";
    const lastName = customerName.slice(1).join(" ") || stripeSession.metadata?.lastName || "";

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

    const product_items: ObjectId[] = [];
    cartItems.forEach((item: { productId: string, quantity: number }) => {
      for (let i = 0; i < item.quantity; i++) {
        product_items.push(new ObjectId(item.productId));
      }
    });

    const totalAmount = stripeSession.amount_total ? stripeSession.amount_total / 100 : 0; // Convert back to dollars

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

    const shippingAddress = deliveryMethod === 'delivery' ? formatAddress(stripeSession.shipping_details?.address) : "";
    const billingAddress = formatAddress(stripeSession.customer_details?.address);

    // Get actual item details for the email
    let itemDetails = [];
    if (cartItems.length > 0) {
      const itemIds = cartItems.map((item: { productId: string }) => new ObjectId(item.productId));
      const itemsData = await itemsCollection.find({ _id: { $in: itemIds } }).toArray();

      // Create a map for quick lookup
      const itemsMap = new Map(itemsData.map(item => [item._id.toString(), item]));

      // Build detailed item list with quantities
      itemDetails = cartItems.map((item: { productId: string; quantity: number; name: string; price: number }) => {
        const dbItem = itemsMap.get(item.productId);
        return {
          id: item.productId,
          name: dbItem?.name || item.name,
          quantity: item.quantity,
          price: dbItem?.price || item.price,
          total: (dbItem?.price || item.price) * item.quantity
        };
      });
    }

    try {
      // Add email_sent field to track if confirmation email was sent
      const orderData = {
        stripe_session_id: sessionId,
        customer_id: new ObjectId(customer._id),
        product_items: product_items,
        order_date: new Date(),
        total_amount: totalAmount,
        delivery_method: deliveryMethod, // ! Added for delivery orders
        shipping_method: stripeSession.shipping_cost?.shipping_rate || "Standard",
        shipping_cost: stripeSession.shipping_cost?.amount_subtotal ? stripeSession.shipping_cost.amount_subtotal / 100 : 0,
        payment_method: stripeSession.payment_method_types[0],
        payment_status: stripeSession.payment_status || 'unknown',
        order_status: "pending",
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        customer_email: stripeSession.customer_details?.email || "",
        first_name: firstName,
        last_name: lastName,
        shipping_id: null,
        is_pickup: deliveryMethod === 'pickup',
        email_sent: false, // Track if email has been sent
        updatedAt: new Date(),
      };

      // Use findOneAndUpdate with upsert option to ensure we only create one order
      // This creates the order if it doesn't exist or returns the existing order
      const orderResult = await ordersCollection.findOneAndUpdate(
        { stripe_session_id: sessionId },
        { $setOnInsert: orderData },
        { upsert: true, returnDocument: 'after' }
      );

      if (!orderResult) {
        throw new Error("Failed to create or retrieve order");
      }

      // Handle different MongoDB driver versions (v5+ returns directly, older versions use .value)
      const order = orderResult.value || orderResult;
      if (!order) {
        throw new Error("Order result is undefined");
      }

      const orderId = order._id;

      // * Update customer with order(s)
      await customersCollection.updateOne(
        { _id: new ObjectId(customer._id) },
        {
          $addToSet: { orders: orderId.toString() },
          $set: { updatedAt: new Date() }
        }
      );

      console.log("Order saved to MongoDB:", orderId.toString());

      // If order was just created (email_sent should be false)
      if (!order.email_sent && verifiedEmail) {
        // Send email and mark as sent
        try {
          let itemsListHtml = '';
          let subtotal = 0;

          if (itemDetails && itemDetails.length > 0) {
            const itemRows = itemDetails.map((item: { total: number; name: any; quantity: any; price: number; }) => {
              subtotal += item.total;
              return `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.price.toFixed(2)}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.total.toFixed(2)}</td>
              </tr>`;
            }).join('');

            const shippingCost = stripeSession.shipping_cost?.amount_subtotal
              ? stripeSession.shipping_cost.amount_subtotal / 100
              : 0;

            itemsListHtml = `
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background-color: #f2f2f2;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Quantity</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Subtotal:</td>
                    <td style="padding: 8px; text-align: right;">$${subtotal.toFixed(2)}</td>
                  </tr>
                  ${shippingCost > 0 ? `
                  <tr>
                    <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Shipping:</td>
                    <td style="padding: 8px; text-align: right;">$${shippingCost.toFixed(2)}</td>
                  </tr>` : ''}
                  <tr>
                    <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold;">$${totalAmount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            `;
          }

          const deliveryInfoHtml = deliveryMethod === 'delivery'
            ? `
              <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
                <h3 style="margin-top: 0;">Delivery Information:</h3>
                <p><strong>Shipping Address:</strong> ${shippingAddress}</p>
                <p><strong>Shipping Method:</strong> ${stripeSession.shipping_cost?.shipping_rate || "Standard"}</p>
              </div>
            `
            : `
              <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
                <h3 style="margin-top: 0;">Pickup Information:</h3>
                <p>Your order will be available for pickup at our studio. We'll notify you when your order is ready.</p>
                <p><strong>Pickup Location:</strong> 4100 Cameron Park Dr suite 118, Cameron Park, CA 95682</p>
              </div>
            `;

          await sendEmail(
            verifiedEmail,
            `Order Confirmation #${orderId.toString().slice(-6)}`,
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333; font-size: 24px;">Order Confirmation</h1>
                <p>Hello ${firstName},</p>
                <p>Thank you for your order! Your purchase has been confirmed:</p>
                
                <div style="background-color: #e6f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #b3d7ff;">
                  <h2 style="margin-top: 0;">Order Details</h2>
                  <p><strong>Order Number:</strong> #${orderId.toString().slice(-6)}</p>
                  <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
                  <p><strong>Delivery Method:</strong> ${deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                  <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
                </div>
                
                ${itemsListHtml}
                
                ${deliveryInfoHtml}
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
                  <p><strong>Order Reference:</strong> ${orderId.toString()}</p>
                  <p>If you need to make changes to your order, please contact us with this reference number.</p>
                </div>
                
                <p style="margin-top: 30px;">
                  Thank you for your purchase!<br />
                  The Studio 26 Team
                </p>
              </div>
            `
          );

          // Mark email as sent
          await ordersCollection.updateOne(
            { _id: orderId },
            { $set: { email_sent: true } }
          );

          console.log(`Order confirmation email sent to: ${verifiedEmail}`);
        } catch (emailError) {
          // Just log the error, don't fail the whole order process
          console.error('Error sending order confirmation email:', emailError);
        }
      } else {
        console.log(`Email already sent for order: ${orderId}`);
      }

      return NextResponse.json({
        success: true,
        orderId: orderId.toString(),
        deliveryMethod,
        message: "Order successfully processed and saved",
        session: {
          id: stripeSession.id,
          amount_total: stripeSession.amount_total,
          customer_details: stripeSession.customer_details,
          payment_status: stripeSession.payment_status,
        }
      });
    } catch (error) {
      // Check for duplicate key error
      if (error instanceof Error && (error as any).code === 11000) {
        const existingOrderRetry = await ordersCollection.findOne({ stripe_session_id: sessionId });
        if (existingOrderRetry) {
          return NextResponse.json({
            success: true,
            orderId: existingOrderRetry._id.toString(),
            deliveryMethod: existingOrderRetry.delivery_method,
            message: "Order has already been processed",
            session: {
              id: stripeSession.id,
              amount_total: stripeSession.amount_total,
              customer_details: stripeSession.customer_details,
              payment_status: stripeSession.payment_status,
            }
          });
        }
      }
      throw error;
    }
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