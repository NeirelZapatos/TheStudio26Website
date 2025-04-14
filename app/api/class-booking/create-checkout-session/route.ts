import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient, ObjectId } from 'mongodb';
import Customer from '@/app/models/Customer';
import mongoose, { Types } from 'mongoose';
import { sendEmail } from '@/app/lib/mailer'; 

const uri = process.env.MONGODB_URI as string;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Define booking interface
interface ClassBooking {
  classId: string;
  name: string;
  price: number;
  quantity: number; // Number of participants
  date: string;
  time: string;
  image_url?: string;
  type: 'class'; // Type identifier
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string
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
    const { classBooking, contactInfo } = await request.json();
    const { firstName, lastName, email, phone, participants } = contactInfo as ContactInfo;

    // * Validate booking data
    if (!classBooking) {
      return NextResponse.json({ error: 'No booking data provided' }, { status: 400 });
    }

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ error: "Either email or phone number is required" }, { status: 400 });
    }

    await connectToDatabase();

    let customer = null;

    if (email) {
      customer = await Customer.findOne({ email });
    } else if (phone) {
      customer = await Customer.findOne({ phone_number: phone });
    }

    // * Create line item for Stripe
    const lineItem = {
      price_data: {
        currency: 'usd',
        product_data: {
          name: classBooking.name,
          description: classBooking.description,
          images: classBooking.image_url ? [classBooking.image_url] : [],
          metadata: {
            classId: classBooking.classId,
            type: classBooking.type || 'class',
            date: classBooking.date,
            time: classBooking.time,
          },
        },
        unit_amount: Math.round(classBooking.price * 100), // Convert to cents
      },
      quantity: classBooking.quantity,
    };

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // * Create a checkout session with the appropriate mode
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'payment',
      success_url: `${origin}/class-booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/class-booking?id=${classBooking.classId}`,
      billing_address_collection: 'required',
      metadata: {
        customerId: customer ? customer._id.toString() : '',
        firstName,
        lastName,
        classId: classBooking.classId,
        participants: classBooking.quantity.toString(),
        ...(email && { email }),
        ...(phone && { phone_number: phone }),
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
      console.error('Error creating Class Booking Session:', err.message);
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

    console.log("Processing class booking for session ID:", sessionId);

    const { client, dbName } = await connectToDatabase();
    const db = client.db(dbName);
    const ordersCollection = db.collection("orders");
    const customersCollection = db.collection("customers");
    const classesCollection = db.collection("courses");

    // * Check if order already exists for this session
    const existingOrder = await ordersCollection.findOne({
      stripe_session_id: sessionId,
      order_type: 'class_booking'
    });

    if (existingOrder) {
      console.log("Class booking already exists for session:", sessionId);
      return NextResponse.json({
        success: true,
        bookingId: existingOrder._id.toString(),
        message: "Booking already processed",
        classDetails: {
          name: existingOrder.class_name || '',
          date: existingOrder.class_booking_details?.class_date || '',
          time: existingOrder.class_booking_details?.class_time || '',
          instructor: existingOrder.class_booking_details?.instructor || '',
          location: existingOrder.class_booking_details?.location || '',
          participants: existingOrder.class_booking_details?.participants || 1
        },
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

    // * Get class ID from metadata
    const classId = session.metadata?.classId;
    const participants = parseInt(session.metadata?.participants || '1', 10);

    if (!classId) {
      return NextResponse.json({ error: "Class ID not found" }, { status: 400 });
    }

    // * Get class details from MongoDB
    const classDetails = await classesCollection.findOne({ _id: new ObjectId(classId) });
    if (!classDetails) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
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

    try {
      // Add email_sent field to track if confirmation email was sent
      const orderData = {
        stripe_session_id: sessionId,
        customer_id: new ObjectId(customer._id),
        course_items: [new ObjectId(classId)],
        order_date: new Date(),
        total_amount: totalAmount,
        payment_method: session.payment_method_types[0],
        payment_status: session.payment_status || 'unknown',
        order_status: "confirmed",
        billing_address: billingAddress,
        customer_email: session.customer_details?.email || "",
        first_name: firstName,
        last_name: lastName,
        order_type: 'class_booking',
        class_name: classDetails.name,
        email_sent: false, // Track if email has been sent
        class_booking_details: {
          class_date: classDetails.date,
          class_time: classDetails.time,
          participants: participants,
          instructor: classDetails.instructor,
          location: classDetails.location,
        },
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
      
      // If order was just created (email_sent should be false)
      if (!order.email_sent && verifiedEmail) {
        // * Update customer with order
        await customersCollection.updateOne(
          { _id: new ObjectId(customer._id) },
          {
            $addToSet: { 
              orders: orderId.toString(),
              classes: new ObjectId(classId)  // Add class to customer's classes array
            },
            $set: { updatedAt: new Date() }
          }
        );

        // * Update class with participant count
        await classesCollection.updateOne(
          { _id: new ObjectId(classId) },
          {
            $inc: { current_participants: participants },
            $set: { updatedAt: new Date() }
          }
        );

        // Send email and mark as sent
        try {
          // Format date and time for display
          const formattedDate = new Date(classDetails.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
      
          await sendEmail(
            verifiedEmail,
            `Confirmation: Your ${classDetails.name} Booking`,
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333; font-size: 24px;">Class Booking Confirmation</h1>
                <p>Hello ${firstName},</p>
                <p>Thank you for your booking! Your class has been confirmed:</p>
                
                <div style="background-color: #e6f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #b3d7ff;">
                  <h2 style="margin-top: 0;">${classDetails.name}</h2>
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Time:</strong> ${classDetails.time}</p>
                  <p><strong>Location:</strong> ${classDetails.location}</p>
                  <p><strong>Instructor:</strong> ${classDetails.instructor}</p>
                  <p><strong>Participants:</strong> ${participants}</p>
                  <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
                </div>
                
                <p>Please arrive 10-15 minutes before the class starts.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
                  <p><strong>Booking Reference:</strong> ${orderId.toString()}</p>
                  <p>If you need to make changes to your booking, please contact us with this reference number.</p>
                </div>
                
                <p style="margin-top: 30px;">
                  Thank you,<br />
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
          
          console.log(`Class booking confirmation email sent to: ${verifiedEmail}`);
        } catch (emailError) {
          // Just log the error, don't fail the whole booking process
          console.error('Error sending class booking confirmation email:', emailError);
        }
      } else {
        console.log(`Email already sent for order: ${orderId}`);
      }

      return NextResponse.json({
        success: true,
        bookingId: orderId.toString(),
        message: "Class booking successfully processed and saved",
        classDetails: {
          name: classDetails.name,
          date: classDetails.date,
          time: classDetails.time,
          instructor: classDetails.instructor,
          location: classDetails.location,
          participants: participants
        },
        session: {
          id: session.id,
          amount_total: session.amount_total,
          customer_details: session.customer_details,
          payment_status: session.payment_status,
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
            classDetails: {
              name: classDetails.name,
              date: classDetails.date,
              time: classDetails.time,
              instructor: classDetails.instructor,
              location: classDetails.location,
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