import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendEmail } from '@/app/lib/mailer';

const uri = process.env.MONGODB_URI as string;

async function connectToDatabase() {
  try {
    // For mongoose models
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri);
    }

    // For direct MongoDB operations
    const client = new MongoClient(uri);
    await client.connect();
    const dbName = client.db().databaseName;

    return { client, dbName };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Connect to database
    const { client, dbName } = await connectToDatabase();
    const db = client.db(dbName);
    const subscriptionsCollection = db.collection("subscriptions");

    // Find all subscriptions for this email
    const subscriptions = await subscriptionsCollection.find({
      $or: [
        { customer_email: email.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    }).toArray();

    // If no subscriptions found, still return success to prevent email enumeration
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No subscriptions found for email: ${email}`);

      // For security, don't reveal whether the email has subscriptions or not
      return NextResponse.json({
        success: true,
        message: "If a subscription exists for this email, a management link has been sent."
      });
    }

    // Get the origin for the management URL
    const origin = request.headers.get('origin') || 'http://localhost:3000' || process.env.NEXTAUTH_URL;

    // Process each subscription
    for (const subscription of subscriptions) {
      // Check if there's already a valid token that's not expired (less than 24 hours old)
      let managementToken = subscription.management_token;
      let tokenCreatedAt = subscription.token_created_at;
      let shouldGenerateNewToken = true;

      // Only generate a new token if the current one is expired or doesn't exist
      if (managementToken && tokenCreatedAt) {
        const tokenDate = new Date(tokenCreatedAt);
        const now = new Date();
        const tokenAge = now.getTime() - tokenDate.getTime();
        const TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (tokenAge < TOKEN_EXPIRY) {
          // Token is still valid, use the existing one
          shouldGenerateNewToken = false;
          console.log(`Using existing valid token for subscription ID: ${subscription._id}`);
        }
      }

      // Generate a new token only if needed
      if (shouldGenerateNewToken) {
        managementToken = crypto.createHash('sha256')
          .update(`${subscription.customer_id || subscription._id}:${subscription._id}:${Date.now()}:${Math.random()}:${process.env.TOKEN_SECRET || 'fallback-secret'}`)
          .digest('hex');

        tokenCreatedAt = new Date();

        // Store the new token with the subscription
        await subscriptionsCollection.updateOne(
          { _id: subscription._id },
          { $set: { management_token: managementToken, token_created_at: tokenCreatedAt } }
        );

        console.log(`Generated new token for subscription ID: ${subscription._id}`);
      }

      // Generate the management URL
      const managementUrl = `${origin}/OpenLab/subscription/manage?token=${managementToken}`;

      // Send email with the management link
      await sendEmail(
        email,
        `Manage Your ${subscription.name || subscription.subscription_name} Subscription`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; font-size: 24px;">Subscription Management</h1>
            <p>Hello ${subscription.first_name},</p>
            <p>You requested access to manage your <strong>${subscription.name || subscription.subscription_name}</strong> subscription.</p>
            
            <div style="background-color: #e6f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #b3d7ff;">
              <p><strong>Manage Your Subscription</strong></p>
              <p>You can view or cancel your subscription using the link below:</p>
              <p style="margin: 15px 0;">
                <a href="${managementUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">Manage Subscription</a>
              </p>
              <p style="font-size: 12px; color: #555;">
                This link will expire in 24 hours for security reasons.
              </p>
            </div>
            
            <p>If you did not request this link, please ignore this email.</p>
            
            <p style="margin-top: 30px;">
              Thank you,<br />
              The Studio 26 Team
            </p>
          </div>
        `
      );

      console.log(`Management link sent for subscription ID: ${subscription._id}`);
    }

    return NextResponse.json({
      success: true,
      message: "Management link(s) sent successfully."
    });
  } catch (err) {
    console.error('Error in request access handler:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  try {
    const { client, dbName } = await connectToDatabase();
    const db = client.db(dbName);
    const subscriptionsCollection = db.collection("subscriptions");

    // Find subscription by token
    const subscription = await subscriptionsCollection.findOne({ management_token: token });

    if (!subscription) {
      return NextResponse.json({ error: 'Token not found', success: false }, { status: 404 });
    }

    // Return token info for debugging
    return NextResponse.json({
      success: true,
      token_info: {
        subscription_id: subscription._id.toString(),
        token_created_at: subscription.token_created_at,
        current_time: new Date(),
        token_age_ms: subscription.token_created_at ?
          (new Date().getTime() - new Date(subscription.token_created_at).getTime()) : 'unknown'
      }
    });
  } catch (err) {
    return NextResponse.json({
      error: 'Token check failed',
      details: err instanceof Error ? err.message : 'An unknown error occurred'
    }, { status: 500 });
  }
}