import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import Customer from '@/app/models/Customer';
import { sendEmail } from '@/app/lib/mailer';

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

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

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
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }
    
    // Check if token is expired
    const tokenTimestamp = subscription.token_created_at || subscription.updatedAt;
    const tokenAge = Date.now() - new Date(tokenTimestamp).getTime();
    const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (tokenAge > TOKEN_EXPIRY) {
      return NextResponse.json({ error: 'Management link has expired. Please request a new one.' }, { status: 401 });
    }

    // Cancel the subscription in Stripe at period end only
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // Update subscription in the database
    await subscriptionsCollection.updateOne(
      { management_token: token },
      { 
        $set: { 
          status: stripeSubscription.status,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          updatedAt: new Date()
        }
      }
    );

    // Get origin for email links
    const origin = request.headers.get('origin') || 'http://localhost:3000' || process.env.NEXTAUTH_URL;
    
    // Send cancellation confirmation email
    try {
      const endDate = new Date(stripeSubscription.current_period_end * 1000).toLocaleDateString();
      
      await sendEmail(
        subscription.customer_email || subscription.email,
        `Your ${subscription.name || subscription.subscription_name} Subscription Has Been Canceled`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; font-size: 24px;">Subscription Cancellation</h1>
            <p>Hello ${subscription.first_name},</p>
            
            <p>We've processed your request to cancel your <strong>${subscription.name || subscription.subscription_name}</strong> subscription at the end of your billing period.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #dee2e6;">
              <p><strong>Cancellation Details:</strong></p>
              <p>Your subscription will remain active until the end of your current billing period (${endDate}).</p>
              <p>You'll continue to have access to all subscription benefits until that date.</p>
            </div>
            
            <p>We're sorry to see you go! If you change your mind, you can always subscribe again from our website:</p>
            <p style="margin: 15px 0;">
              <a href="${origin}/OpenLab" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">View Lab Subscriptions</a>
            </p>
            
            <p>If you have any questions or feedback about your subscription, please don't hesitate to contact us.</p>
            
            <p style="margin-top: 30px;">
              Thank you,<br />
              The Studio 26 Team
            </p>
          </div>
        `
      );
    } catch (emailError) {
      console.error("Error sending cancellation confirmation email:", emailError);
      // Don't fail the request if email sending fails
    }

    return NextResponse.json({
      success: true,
      message: 'Your subscription will be canceled at the end of your current billing period.',
      subscription: {
        status: stripeSubscription.status,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        current_period_end: new Date(stripeSubscription.current_period_end * 1000)
      }
    });
  } catch (err) {
    console.error('Error canceling subscription:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}