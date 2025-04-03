import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import dbConnect from '@/app/lib/dbConnect';
import Subscription from '@/app/models/Subscription';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// GET handler - Fetch all active subscription plans
export async function GET() {
  try {
    await dbConnect();
    
    // Get all active subscription plans
    const subscriptions = await Subscription.find({ active: true }).sort({ price: 1 });
    
    return NextResponse.json(subscriptions);
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Error fetching subscriptions' },
      { status: 500 }
    );
  }
}

// ! MOST LIKELY WILL NOT NEED
// POST handler - Create a new subscription plan (admin only)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();
    
    // Create the product in Stripe first
    const stripeProduct = await stripe.products.create({
      name: data.name,
      description: data.description,
      images: data.image_url ? [data.image_url] : undefined,
      metadata: {
        features: data.features ? JSON.stringify(data.features) : '',
      }
    });
    
    // Create a price for the product
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(data.price * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: data.interval || 'month',
        interval_count: data.intervalCount || 1,
      },
      metadata: {
        product_id: stripeProduct.id,
      }
    });
    
    // Create the subscription in your database
    const subscription = new Subscription({
      ...data,
      stripeProductId: stripeProduct.id,
      stripePriceId: stripePrice.id,
    });
    
    await subscription.save();
    
    return NextResponse.json(subscription, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating subscription' },
      { status: 500 }
    );
  }
}