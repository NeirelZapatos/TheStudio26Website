import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient, ObjectId } from 'mongodb';
import Customer from '@/app/models/Customer';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI as string;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Define lab booking interface
interface LabBooking {
  labId: string;
  name: string;
  price: number;
  quantity: number; // Number of participants
  date: string;
  time: string;
  image_url?: string;
  description?: string;
  type: 'lab'; // Type identifier
  rentalEquipment?: string[]; // Array of IDs
  comments?: string;
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  participants?: number;
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
    const { labBooking, contactInfo } = await request.json();
    const { firstName, lastName, email, phone, participants } = contactInfo as ContactInfo;

    // * Validate booking data
    if (!labBooking) {
      return NextResponse.json({ error: 'No booking data provided' }, { status: 400 });
    }

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }

    await connectToDatabase();

    let customer = null;

    if (email) {
      customer = await Customer.findOne({ email });
    } else if (phone) {
      customer = await Customer.findOne({ phone_number: phone });
    }

    const lineItems = [];
    // * Create line item for Stripe
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: labBooking.name,
          description: labBooking.description,
          images: labBooking.image_url ? [labBooking.image_url] : [],
          metadata: {
            labId: labBooking.labId,
            type: labBooking.type || 'lab',
            date: labBooking.date,
            time: labBooking.time,
          },
        },
        unit_amount: Math.round(labBooking.price * 100), // Convert to cents
      },
      quantity: labBooking.quantity,
    });

    if (labBooking.rentalEquipment && labBooking.rentalEquipment.length > 0) {
      try {
        if (!mongoose.connection || !mongoose.connection.db) {
          throw new Error("MongoDB connection is not established");
        }
        const db = await mongoose.connection.db;
        const rentalEquipmentCollection = db.collection('rentalitems');

        const rentalItems = await rentalEquipmentCollection.find({
          _id: { $in: labBooking.rentalEquipment.map((id: any) => new ObjectId(id)) },
        }).toArray();

        for (const item of rentalItems) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: item.name,
                description: 'Rental Equipment - ${item.name}',
                metadata: {
                  type: 'rental_item',
                  rentalItemId: item._id.toString(),
                },
              },
              unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: labBooking.quantity, // ! POSSSIBLY CHANGE
          });
        }
      } catch (error) {
        console.error("Error fetching rentals:", error);
      }
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // * Create a checkout session with the appropriate mode
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/OpenLab/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/OpenLab?id=${labBooking.labId}`,
      billing_address_collection: 'required',
      metadata: {
        customerId: customer ? customer._id.toString() : '',
        firstName,
        lastName,
        labId: labBooking.labId,
        participants: labBooking.quantity.toString(),
        ...(email && { email }),
        ...(phone && { phone_number: phone }),
        ...(labBooking.comments && { comments: labBooking.comments.substring(0, 500) }),
        ...(labBooking.rentalEquipment && labBooking.rentalEquipment.length > 0 && {
          rentalEquipmentIds: labBooking.rentalEquipment.join(',').substring(0, 500)
        }),
      },
      automatic_tax: { enabled: true },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes expiration
    };

    if (email) {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ id: session.id });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error creating Lab Booking Session:', err.message);
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
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log("Processing lab booking for session ID:", sessionId);

    const { client, dbName } = await connectToDatabase();
    const db = client.db(dbName);
    const ordersCollection = db.collection("orders");
    const customersCollection = db.collection("customers");
    const labsCollection = db.collection("labs");

    // * Check if order already exists for this session
    const existingOrder = await ordersCollection.findOne({
      stripe_session_id: sessionId,
      order_type: 'lab_booking'
    });

    if (existingOrder) {
      console.log("Lab booking already exists for session:", sessionId);
      return NextResponse.json({
        success: true,
        bookingId: existingOrder._id.toString(),
        message: "Booking already processed",
        labDetails: {
          name: existingOrder.lab_name || '',
          date: existingOrder.lab_booking_details?.lab_date || '',
          time: existingOrder.lab_booking_details?.lab_time || '',
          location: existingOrder.lab_booking_details?.location || '',
          participants: existingOrder.lab_booking_details?.participants || 1
        },
        session: {
          id: sessionId,
          customer_details: {
            email: existingOrder.customer_email,
            name: `${existingOrder.first_name} ${existingOrder.last_name}`,
          },
          amount_total: existingOrder.total_amount * 100,
          payment_status: existingOrder.payment_status,
        },
        lab_booking_details: {
          participants: existingOrder.lab_booking_details?.participants || 1,
          comments: existingOrder.lab_booking_details?.comments || "",
          rental_equipment: existingOrder.lab_booking_details?.rental_equipment || []
        }
      });
    }

    // * Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });

    console.log("Retrieved Stripe session, payment status:", session.payment_status);

    // * Get lab ID from metadata
    const labId = session.metadata?.labId;
    const participants = parseInt(session.metadata?.participants || '1', 10);

    if (!labId) {
      return NextResponse.json({ error: "Lab ID not found" }, { status: 400 });
    }

    // * Get lab details from MongoDB
    const labDetails = await labsCollection.findOne({ _id: new ObjectId(labId) });
    if (!labDetails) {
      return NextResponse.json({ error: "Lab not found" }, { status: 404 });
    }

    const verifiedEmail = session.customer_details?.email || session.metadata?.email;
    const verifiedPhone = session.customer_details?.phone || session.metadata?.phone_number;

    if (!verifiedEmail && !verifiedPhone) {
      return NextResponse.json({ error: "Customer contact info not found" }, { status: 400 });
    }

    let customerQuery = {};
    if (verifiedEmail) {
      customerQuery = { email: verifiedEmail };
    } else if (verifiedPhone) {
      customerQuery = { phone_number: verifiedPhone };
    }

    let customer = await customersCollection.findOne(customerQuery);

    const customerName = session.customer_details?.name?.split(" ") || [];
    const firstName = customerName[0] || session.metadata?.firstName || "";
    const lastName = customerName.slice(1).join(" ") || session.metadata?.lastName || "";

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

    const billingAddress = formatAddress(session.customer_details?.address);

    const rentalEquipmentIds = session.metadata?.rentalEquipmentIds
      ? session.metadata.rentalEquipmentIds.split(',').map(id => new ObjectId(id))
      : [];

    let rentalItems: any[] = [];
    if (rentalEquipmentIds.length > 0 && db) {
      try {
        rentalItems = await db.collection("rentalitems").find({
          _id: { $in: rentalEquipmentIds }
        }).toArray();
      } catch (error) {
        console.error('Error fetching rental items for order:', error);
      }
    }

    try {
      const orderData = {
        stripe_session_id: sessionId,
        customer_id: new ObjectId(customer._id),
        lab_items: [new ObjectId(labId)],
        order_date: new Date(),
        total_amount: totalAmount,
        payment_method: session.payment_method_types[0],
        payment_status: session.payment_status || 'unknown',
        order_status: "confirmed",
        billing_address: billingAddress,
        customer_email: session.customer_details?.email || "",
        first_name: firstName,
        last_name: lastName,
        order_type: 'lab_booking',
        lab_name: labDetails.name,
        lab_booking_details: {
          lab_date: labDetails.date,
          lab_time: labDetails.time,
          participants: participants,
          location: labDetails.location,
          comments: session.metadata?.comments || "",
          rental_equipment: rentalItems.map(item => ({
            id: item._id,
            name: item.name,
            description: item.description,
          }))
        },
        updatedAt: new Date(),
      };

      const orderResult = await ordersCollection.insertOne(orderData);
      const orderId = orderResult.insertedId;

      // * Update customer with order
      await customersCollection.updateOne(
        { _id: new ObjectId(customer._id) },
        {
          $addToSet: { orders: orderId.toString() },
          $set: { updatedAt: new Date() }
        }
      );

      // * Update lab with participant count
      await labsCollection.updateOne(
        { _id: new ObjectId(labId) },
        {
          $inc: { current_participants: participants },
          $set: { updatedAt: new Date() }
        }
      );

      console.log("Lab booking saved to orders collection:", orderId.toString());

      return NextResponse.json({
        success: true,
        bookingId: orderId.toString(),
        message: "Lab booking successfully processed and saved",
        labDetails: {
          name: labDetails.name,
          date: labDetails.date,
          time: labDetails.time,
          location: labDetails.location,
          participants: participants
        },
        session: {
          id: session.id,
          amount_total: session.amount_total,
          customer_details: session.customer_details,
          payment_status: session.payment_status,
        },
        lab_booking_details: {
          participants: participants,
          comments: session.metadata?.comments || "",
          rental_equipment: rentalItems.map(item => ({
            id: item._id,
            name: item.name,
            description: item.description,
          }))
        }
      });
    } catch (error) {
      // Check if it's a duplicate key error
      if (error instanceof Error && (error as any).code === 11000) {
        // Someone else just processed this order, fetch it
        const justCreatedOrder = await ordersCollection.findOne({ stripe_session_id: sessionId });

        if (justCreatedOrder) {
          return NextResponse.json({
            success: true,
            bookingId: justCreatedOrder._id.toString(),
            message: "Booking was just processed by another request",
            labDetails: {
              name: labDetails.name,
              date: labDetails.date,
              time: labDetails.time,
              location: labDetails.location,
            },
            session: {
              id: session.id,
              amount_total: session.amount_total,
              customer_details: session.customer_details,
              payment_status: session.payment_status,
            }
          });
        }
      }
      // If it's another type of error, rethrow it
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