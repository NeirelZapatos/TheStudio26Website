import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import Customer from '@/app/models/Customer';
import crypto from 'crypto';
import { sendEmail } from '@/app/lib/mailer';

const uri = process.env.MONGODB_URI as string;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

interface SubscriptionInfo {
  subscriptionId: string;
  stripePriceId?: string;
  quantity: number;
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
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
    const { subscriptionInfo, contactInfo } = await request.json();
    const { firstName, lastName, email, phone } = contactInfo as ContactInfo;

    if (!subscriptionInfo) {
      return NextResponse.json({ error: 'Missing subscription info' }, { status: 400 });
    }

    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required for subscriptions" }, { status: 400 });
    }

    if (!subscriptionInfo.subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 });
    }

    // Connect to database
    await connectToDatabase();

    const { client, dbName } = await connectToDatabase();
    const db = client.db(dbName);
    const subscriptionPlansCollection = db.collection("subscription_plans");
    const subscriptionsCollection = db.collection("subscriptions");

    // Find the subscription plan
    const subscriptionPlan = await subscriptionPlansCollection.findOne({
      _id: new ObjectId(subscriptionInfo.subscriptionId)
    });

    if (!subscriptionPlan) {
      return NextResponse.json({ error: "Subscription plan not found" }, { status: 404 });
    }

    if (!subscriptionPlan.stripePriceId) {
      return NextResponse.json({ error: "Stripe Price ID not found for this subscription" }, { status: 400 });
    }

    // Find or create customer
    let customer = await Customer.findOne({ email });
    let customerId = '';

    if (customer) {
      customerId = customer._id.toString();

      // Check if customer already has an active subscription to this plan
      const existingSubscription = await subscriptionsCollection.findOne({
        customer_id: new ObjectId(customerId),
        subscription_plan_id: new ObjectId(subscriptionInfo.subscriptionId),
        status: { $in: ['active', 'trialing'] }
      });

      if (existingSubscription) {
        // Generate management URL for existing subscription
        const origin = request.headers.get('origin') || 'http://localhost:3000';
        let managementToken = existingSubscription.management_token;

        // Generate a new token if none exists
        if (!managementToken) {
          managementToken = crypto.createHash('sha256')
            .update(`${customer._id}:${existingSubscription.stripe_subscription_id}:${Date.now()}:${Math.random()}:${process.env.TOKEN_SECRET || 'fallback-secret'}`)
            .digest('hex');

          // Update the token
          await subscriptionsCollection.updateOne(
            { _id: existingSubscription._id },
            { $set: { management_token: managementToken, token_created_at: new Date() } }
          );
        }

        const managementUrl = `${origin}/OpenLab/subscription/manage?token=${managementToken}`;

        return NextResponse.json({
          error: "You already have an active subscription to this plan",
          status: "already_subscribed",
          managementUrl: managementUrl,
          subscriptionId: existingSubscription._id.toString()
        }, { status: 400 });
      }

      // Update customer information if needed
      await Customer.updateOne(
        { _id: customer._id },
        {
          $set: {
            first_name: firstName,
            last_name: lastName,
            ...(phone && { phone_number: phone })
          }
        }
      );
    } else {
      // Create new customer
      const newCustomer = new Customer({
        email,
        first_name: firstName,
        last_name: lastName,
        ...(phone && { phone_number: phone }),
        orders: [],
        labs: [],
        subscriptions: [],
        has_active_subscription: false
      });

      await newCustomer.save();
      customer = newCustomer;
      customerId = newCustomer._id.toString();
      console.log("Created new customer:", customerId);
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe Checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: subscriptionPlan.stripePriceId,
          quantity: subscriptionInfo.quantity || 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/OpenLab/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/OpenLab/subscription-checkout?id=${subscriptionInfo.subscriptionId}`,
      billing_address_collection: 'required',
      metadata: {
        customerId,
        firstName,
        lastName,
        subscriptionId: subscriptionInfo.subscriptionId,
        subscriptionName: subscriptionPlan.name,
        subscriptionInterval: subscriptionPlan.interval,
        subscriptionPrice: subscriptionPlan.price.toString(),
        ...(email && { email }),
        ...(phone && { phone_number: phone }),
      },
      automatic_tax: { enabled: true },
      customer_email: email,
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ sessionId: session.id });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error creating subscription checkout session:", err.message);
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

    console.log("Processing subscription for session ID:", sessionId);

    const { client, dbName } = await connectToDatabase();
    const db = client.db(dbName);
    const subscriptionsCollection = db.collection("subscriptions");

    // Check if subscription already exists for this session
    const existingSubscription = await subscriptionsCollection.findOne({
      stripe_session_id: sessionId
    });

    if (existingSubscription) {
      console.log("Subscription already exists for session:", sessionId);
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      const managementUrl = existingSubscription.management_token
        ? `${origin}/OpenLab/subscription/manage?token=${existingSubscription.management_token}`
        : null;

      return NextResponse.json({
        success: true,
        subscriptionId: existingSubscription._id.toString(),
        message: "Subscription already processed",
        managementUrl,
        subscription: {
          name: existingSubscription.subscription_name || '',
          status: existingSubscription.status || '',
          stripe_subscription_id: existingSubscription.stripe_subscription_id || '',
          current_period_end: existingSubscription.current_period_end,
          current_period_start: existingSubscription.current_period_start,
        },
        session: {
          id: sessionId,
          customer_details: {
            email: existingSubscription.customer_email,
            name: `${existingSubscription.first_name} ${existingSubscription.last_name}`,
          },
          payment_status: existingSubscription.payment_status,
        }
      });
    }

    // Retrieve session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details', 'subscription'],
    });

    console.log("Retrieved Stripe session, payment status:", session.payment_status);

    const verifiedEmail = session.customer_details?.email || session.metadata?.email;
    const verifiedPhone = session.customer_details?.phone || session.metadata?.phone_number;

    if (!verifiedEmail) {
      return NextResponse.json({ error: "Customer contact info not found" }, { status: 400 });
    }

    let customer = await Customer.findOne({ email: verifiedEmail });

    const customerName = session.customer_details?.name?.split(" ") || [];
    const firstName = customerName[0] || session.metadata?.firstName || "";
    const lastName = customerName.slice(1).join(" ") || session.metadata?.lastName || "";
    const subscriptionPlanId = session.metadata?.subscriptionId;

    if (customer) {
      // Check for existing active subscription to the same plan before processing
      if (subscriptionPlanId) {
        const existingActiveSub = await subscriptionsCollection.findOne({
          customer_id: new ObjectId(customer._id),
          subscription_plan_id: new ObjectId(subscriptionPlanId),
          status: { $in: ['active', 'trialing'] }
        });

        if (existingActiveSub) {
          console.log(`Customer ${customer._id} already has active subscription to plan ${subscriptionPlanId}`);

          // Generate management URL
          const origin = request.headers.get('origin') || 'http://localhost:3000';
          const managementUrl = existingActiveSub.management_token
            ? `${origin}/OpenLab/subscription/manage?token=${existingActiveSub.management_token}`
            : null;

          return NextResponse.json({
            success: false,
            error: "You already have an active subscription to this plan",
            status: "already_subscribed",
            existingSubscriptionId: existingActiveSub._id.toString(),
            managementUrl
          }, { status: 400 });
        }
      }

      // Update existing customer with verified info
      await Customer.findByIdAndUpdate(
        customer._id,
        {
          $set: {
            first_name: firstName || customer.first_name,
            last_name: lastName || customer.last_name,
            ...(verifiedPhone && { phone_number: verifiedPhone }),
            updatedAt: new Date()
          }
        }
      );
    } else {
      // Create new customer
      customer = new Customer({
        email: verifiedEmail,
        first_name: firstName,
        last_name: lastName,
        ...(verifiedPhone && { phone_number: verifiedPhone }),
        orders: [],
        labs: [],
        subscriptions: [],
        has_active_subscription: false
      });
      await customer.save();
    }

    if (!customer) {
      return NextResponse.json({ error: "Failed to create or update customer" }, { status: 500 });
    }

    // Format address for records
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

    // Make sure we get the ID as a string
    const stripeSubscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription as any)?.id;

    if (!stripeSubscriptionId || typeof stripeSubscriptionId !== 'string') {
      return NextResponse.json({ error: "Invalid subscription ID from Stripe" }, { status: 400 });
    }

    try {
      // Retrieve subscription details from Stripe with proper string ID
      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

      // Generate a management token for this subscription
      const managementToken = crypto.createHash('sha256')
        .update(`${customer._id}:${stripeSubscriptionId}:${Date.now()}:${process.env.TOKEN_SECRET || 'fallback-secret'}`)
        .digest('hex');

      // Prepare subscription data
      const subscriptionData = {
        stripe_session_id: sessionId,
        stripe_subscription_id: stripeSubscriptionId,
        customer_id: new ObjectId(customer._id),
        subscription_date: new Date(),
        subscription_plan_id: new ObjectId(session.metadata?.subscriptionId || ""),
        subscription_name: session.metadata?.subscriptionName || "Lab Subscription",
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000),
        current_period_start: new Date(subscription.current_period_start * 1000),
        cancel_at_period_end: subscription.cancel_at_period_end,
        billing_address: billingAddress,
        customer_email: verifiedEmail,
        first_name: firstName,
        last_name: lastName,
        payment_status: session.payment_status || 'unknown',
        stripe_customer_id: subscription.customer as string,
        management_token: managementToken,
        token_created_at: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await subscriptionsCollection.insertOne(subscriptionData);

      if (!result.acknowledged || !result.insertedId) {
        throw new Error("Failed to insert subscription record");
      }

      const subscriptionId = result.insertedId;
      console.log("Subscription saved with ID:", subscriptionId.toString());

      // Update customer with subscription ID and set active subscription flag
      await Customer.findByIdAndUpdate(
        customer._id,
        {
          $addToSet: { subscriptions: subscriptionId },
          $set: {
            has_active_subscription: subscription.status === 'active',
            updatedAt: new Date(),
            stripe_customer_id: subscription.customer as string
          }
        }
      );

      console.log("Updated customer subscription array for:", customer._id.toString());

      // Generate management URL
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      const managementUrl = `${origin}/OpenLab/subscription/manage?token=${managementToken}`;

      // Send confirmation email with management link
      try {
        await sendEmail(
          verifiedEmail,
          `Your Subscription to ${session.metadata?.subscriptionName || "Lab Subscription"} is Confirmed`,
          `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #333; font-size: 24px;">Subscription Confirmation</h1>
              <p>Hello ${firstName} ${lastName},</p>
              <p>Thank you for subscribing to <strong>${session.metadata?.subscriptionName || "Lab Subscription"}</strong>!</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Subscription Details:</strong></p>
                <p>Current billing period ends: ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}</p>
              </div>
              
              <div style="background-color: #e6f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #b3d7ff;">
                <p><strong>Manage Your Subscription</strong></p>
                <p>You can view or cancel your subscription at any time using the link below:</p>
                <p style="margin: 15px 0;">
                  <a href="${managementUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Manage Subscription</a>
                </p>
                <p style="font-size: 12px; color: #555;">
                  For security reasons, please save this link as it provides direct access to manage your subscription.
                  If you lose this link, you can always request a new one on our website.
                </p>
              </div>
              
              <p>If you have any questions about your subscription, please contact our support team.</p>
              
              <p style="margin-top: 30px;">
                Thank you,<br />
                The Studio 26 Team
              </p>
            </div>
          `
        );
        console.log("Subscription confirmation email sent to:", verifiedEmail);
      } catch (emailError) {
        console.error("Error sending subscription confirmation email:", emailError);
      }

      return NextResponse.json({
        success: true,
        subscriptionId: subscriptionId.toString(),
        message: "Subscription successfully processed and saved",
        managementUrl: managementUrl,
        managementToken: managementToken,
        subscription: {
          name: session.metadata?.subscriptionName || "Lab Subscription",
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000),
          current_period_start: new Date(subscription.current_period_start * 1000),
          stripe_subscription_id: stripeSubscriptionId,
        },
        session: {
          id: session.id,
          customer_details: session.customer_details,
          payment_status: session.payment_status,
        }
      });
    } catch (error) {
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