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
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Process each subscription to generate management tokens if needed
    for (const subscription of subscriptions) {
      let managementToken = subscription.management_token;

      // If no management token exists, generate one
      if (!managementToken) {
        managementToken = crypto.createHash('sha256')
          .update(`${subscription.customer_id}:${subscription._id}:${Date.now()}:${process.env.TOKEN_SECRET || 'fallback-secret'}`)
          .digest('hex');

        // Store the token with the subscription
        await subscriptionsCollection.updateOne(
          { _id: subscription._id },
          { $set: { management_token: managementToken, token_created_at: new Date() } }
        );
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