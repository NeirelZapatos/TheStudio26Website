import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI as string;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function connectToDatabase() {
  try {
    // For mongoose models
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }

    // For direct MongoDB operations
    const client = new MongoClient(uri);
    await client.connect();

    // Get database name from the connection
    const dbName = client.db().databaseName;

    return { client, dbName };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function GET(request: Request) {

  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Management token is required' }, { status: 400 });
    }

    // Connect to database
    const { client, dbName } = await connectToDatabase();
    const db = client.db(dbName);
    const subscriptionsCollection = db.collection("subscriptions");

    // Find subscription by token
    const subscription = await subscriptionsCollection.findOne({ management_token: token });

    if (!subscription) {
      console.log(`Subscription not found for token: ${token.substring(0, 10)}...`);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Check token expiration with detailed logging
    console.log('Full subscription record:', JSON.stringify(subscription, null, 2));


    const tokenCreatedAt = subscription.token_created_at ? new Date(subscription.token_created_at) : null;
    const updatedAt = subscription.updatedAt ? new Date(subscription.updatedAt) : null;
    const now = new Date();

    console.log('Current server time:', now.toISOString());
    console.log('Token created at:', tokenCreatedAt ? tokenCreatedAt.toISOString() : 'null');
    console.log('Updated at:', updatedAt ? updatedAt.toISOString() : 'null');

    const tokenTimestamp = subscription.token_created_at || subscription.updatedAt;

    if (!tokenTimestamp) {
      console.log(`Token timestamp missing for subscription ID: ${subscription._id.toString()}`);
      return NextResponse.json({
        error: 'Could not validate token expiration, please request a new management link'
      }, { status: 401 });
    }

    const tokenDate = new Date(tokenTimestamp);
    console.log('Token timestamp used for calculation:', tokenDate.toISOString());

    const tokenAge = now.getTime() - tokenDate.getTime();
    console.log('Calculated token age (ms):', tokenAge);

    const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    console.log('Token expiry threshold (ms):', TOKEN_EXPIRY);

    if (tokenAge > TOKEN_EXPIRY) {
      console.log(`Token expired for subscription ID: ${subscription._id.toString()}, age: ${tokenAge}ms`);
      console.log(`Token created: ${tokenDate.toISOString()}, Now: ${now.toISOString()}`);
      return NextResponse.json({ 
        error: 'Management link has expired. Please request a new one.' 
      }, { status: 401 });
    }
    
    // Validate Stripe subscription ID exists
    if (!subscription.stripe_subscription_id) {
      console.log(`Missing Stripe subscription ID for subscription: ${subscription._id.toString()}`);
      return NextResponse.json({ 
        error: 'Subscription record is missing Stripe information' 
      }, { status: 500 });
    }
    
    // Get the latest subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription._id.toString(),
        name: subscription.name || subscription.subscription_name,
        status: stripeSubscription.status,
        current_period_end: new Date(stripeSubscription.current_period_end * 1000),
        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
        stripe_subscription_id: subscription.stripe_subscription_id,
        customer: {
          first_name: subscription.first_name,
          last_name: subscription.last_name,
          email: subscription.customer_email || subscription.email
        },
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        price: stripeSubscription.items.data[0]?.price.unit_amount
          ? (stripeSubscription.items.data[0].price.unit_amount / 100)
          : null,
        interval: stripeSubscription.items.data[0]?.price.recurring?.interval || 'month'
      }
    });
  } catch (err) {
    console.error('Error retrieving subscription:', err);
    return NextResponse.json({ error: 'An error occurred while retrieving subscription details' }, { status: 500 });
  }
}