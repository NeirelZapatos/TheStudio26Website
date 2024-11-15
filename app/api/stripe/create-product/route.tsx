import { NextResponse } from 'next/server';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);


export async function POST(req: Request) {
  try {
    const data = await req.json(); // Extract the data sent from the frontend
    const { name, description, price, recurring, purchaseType } = data;

    const product = await stripe.products.create({
      name: name,
      description: description,
      metadata: {
        purchaseType,
      }
    });

    const priceData = await stripe.prices.create({
      product: product.id,
      unit_amount: price,
      currency: 'usd',
      recurring: recurring ? { interval: 'month' } : undefined, //
    });

    return NextResponse.json({ product, price: priceData });
  } catch (error) {
    console.error('Error creating product and price:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create product and price', details: error }), {
      status: 500,
    });
  }
}