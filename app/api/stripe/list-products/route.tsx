import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);


export async function GET() {
  try {
    const products = await stripe.products.list({ limit: 10 });
    return NextResponse.json(products.data);
  } catch (error) {
    console.error('Error listing products:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to list products', details: error }), { status: 500 });
  }
}