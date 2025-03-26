import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient, ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

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

    const dbClient = await connectToDatabase();
    const db = dbClient.db("test");
    const itemsCollection = db.collection("items");
    const coursesCollection = db.collection("courses");

    // * Get product names from the cart
    const productNames = cartItems.map((product: any) => product.name);

    // * Match products by name from their respective collection
    const [itemsFromDb, coursesFromDb] = await Promise.all([
      itemsCollection.find({ name: { $in: productNames } }).toArray(),
      coursesCollection.find({ name: { $in: productNames } }).toArray(),
    ]);

    console.log(`Found ${itemsFromDb.length} items and ${coursesFromDb.length} courses matching cart names`);

    // * Create a mapping of name to MongoDB ID
    const itemNameToIdMap: Record<string, string> = {};
    itemsFromDb.forEach(item => {
      itemNameToIdMap[item.name] = item._id.toString();
    });

    const courseNameToIdMap: Record<string, string> = {};
    coursesFromDb.forEach(course => {
      courseNameToIdMap[course.name] = course._id.toString();
    });

    // * Create Line items for stripe
    // * "Invoice Line Items represent the individual lines within an invoice and only exist within the context of an invoice"
    const mongoItemIds: string[] = [];
    const mongoCourseIds: string[] = [];
    const lineItems: any[] = [];

    cartItems.forEach((product: any) => {
      const isItem = itemNameToIdMap[product.name];
      const isCourse = courseNameToIdMap[product.name];

      // * If it is an item
      if (isItem) {
        mongoItemIds.push(itemNameToIdMap[product.name]);

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: [product.image_url],
              metadata: {
                mongoId: itemNameToIdMap[product.name],
                type: 'product'
              }
            },
            unit_amount: Math.round(product.price * 100), // convert unit amount to cents
          },
          quantity: product.quantity,
        });
      }
      // * If it is a course
      else if (isCourse) {
        mongoCourseIds.push(courseNameToIdMap[product.name]);

        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: [product.image_url],
              metadata: {
                mongoId: courseNameToIdMap[product.name],
                type: 'product'
              }
            },
            unit_amount: Math.round(product.price * 100), // convert unit amount to cents
          },
          quantity: product.quantity,
        });
      }

      // * NOT FOUND
      else {
        console.log(`Warning: Item "${product.name}" not found in any collection`);
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: product.description,
              images: [product.image_url],
              metadata: {
                type: 'unknown'
              }
            },
            unit_amount: Math.round(product.price * 100),
          },
          quantity: product.quantity,
        });
      }
    })

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // * Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`, // Redirect URL after successful payment
      cancel_url: `${request.headers.get('origin')}/checkout`, // Redirect URL if payment is canceled
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      billing_address_collection: 'required',
      automatic_tax: {
        enabled: true,
      },
      customer_email: customerEmail,
      metadata: {
        tempCustomerEmail: customerEmail || "",
        tempFirstName: firstName || "",
        tempLastName: lastName || "",
        mongoItemIds: JSON.stringify(mongoItemIds),
        mongoCourseIds: JSON.stringify(mongoCourseIds)
      },
    });

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