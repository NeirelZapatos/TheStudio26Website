import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Customer from '@/app/models/Customer';
import CustomerSubscription from '@/app/models/CustomerSubscription';
import Stripe from 'stripe';
import mongoose from 'mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// GET handler - Fetch a customer's subscriptions
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    // Find the customer
    const customer = await Customer.findById(params.id);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Find all subscriptions for the customer
    const subscriptions = await CustomerSubscription.find({
      customer_id: new mongoose.Types.ObjectId(params.id)
    }).populate('items.productId');
    
    return NextResponse.json(subscriptions);
  } catch (error: any) {
    console.error(`Error fetching subscriptions for customer ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'Error fetching customer subscriptions' },
      { status: 500 }
    );
  }
}

// POST handler - Create a customer portal session for subscription management
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { returnUrl } = await request.json();
    await dbConnect();
    
    // Find the customer
    const customer = await Customer.findById(params.id);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // Ensure customer has a Stripe customer ID
    if (!customer.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Customer has no Stripe account' },
        { status: 400 }
      );
    }
    
    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: returnUrl || process.env.NEXT_PUBLIC_URL || 'http://localhost:3000/account',
    });
    
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error(`Error creating portal session for customer ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || 'Error creating customer portal session' },
      { status: 500 }
    );
  }
}