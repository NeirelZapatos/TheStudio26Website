import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Subscription from '@/app/models/Subscription';
import Stripe from 'stripe';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// GET handler - Fetch a specific subscription plan
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const subscription = await Subscription.findById(params.id);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(subscription);
  } catch (error: any) {
    console.error(`Error fetching subscription ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'Error fetching subscription' },
      { status: 500 }
    );
  }
}

// ! MOST LIKLEY WILL NOT NEED
// PUT handler - Update a subscription (admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    await dbConnect();
    
    // Find existing subscription
    const subscription = await Subscription.findById(params.id);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Update the product in Stripe
    if (subscription.stripeProductId) {
      await stripe.products.update(subscription.stripeProductId, {
        name: data.name || subscription.name,
        description: data.description || subscription.description,
        images: data.image_url ? [data.image_url] : undefined,
        active: typeof data.active === 'boolean' ? data.active : subscription.active,
        metadata: {
          features: data.features ? JSON.stringify(data.features) : '',
        }
      });
    }
    
    // If price changed, create a new price in Stripe
    if (data.price && data.price !== subscription.price ||
        data.interval && data.interval !== subscription.interval ||
        data.intervalCount && data.intervalCount !== subscription.intervalCount) {
      
      const newPrice = await stripe.prices.create({
        product: subscription.stripeProductId,
        unit_amount: Math.round((data.price || subscription.price) * 100),
        currency: 'usd',
        recurring: {
          interval: data.interval || subscription.interval,
          interval_count: data.intervalCount || subscription.intervalCount,
        },
        metadata: {
          product_id: subscription.stripeProductId,
        }
      });
      
      // Deactivate old price
      if (subscription.stripePriceId) {
        // Note: Stripe doesn't allow deleting prices, but you can archive them by creating a new one
        // and updating your references
      }
      
      // Update the price ID in your database
      data.stripePriceId = newPrice.id;
    }
    
    // Update subscription in database
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedSubscription);
  } catch (error: any) {
    console.error(`Error updating subscription ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'Error updating subscription' },
      { status: 500 }
    );
  }
}

// ! MOST LIKLEY WILL NOT NEED
// DELETE handler - Delete/Deactivate a subscription (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const subscription = await Subscription.findById(params.id);
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Instead of deleting, we'll deactivate both in Stripe and our DB
    if (subscription.stripeProductId) {
      await stripe.products.update(subscription.stripeProductId, {
        active: false
      });
    }
    
    // Deactivate in our database
    await Subscription.findByIdAndUpdate(params.id, { active: false });
    
    return NextResponse.json({ message: 'Subscription deactivated successfully' });
  } catch (error: any) {
    console.error(`Error deactivating subscription ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'Error deactivating subscription' },
      { status: 500 }
    );
  }
}