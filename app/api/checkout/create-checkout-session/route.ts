import dbConnect from '@/app/lib/dbConnect';
import Item from '@/app/models/Item';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
  try {
    const { itemIds } = await request.json(); // Array of item ID's to checkout

    await dbConnect(); // connect to database

    const items = await Item.find({ _id: { $in: itemIds } });

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items found' }, { status: 404 });
    }

    const totalSum = items.reduce((total, item) => total + item.price * 100, 0); // Converting to cents

    // Create Line items for stripe
    // "Invoice Line Items represent the individual lines within an invoice and only exist within the context of an invoice"
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
          images: [item.image_url],
        },
        unit_amount: Math.round(item.price * 100), // convert unit amount to cents
      },
      quantity: 1,
    }));

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/CheckOut/success`, // Redirect URL after successful payment
      cancel_url: `${request.headers.get('origin')}/CheckOut/cancel`, // Redirect URL if payment is canceled
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      billing_address_collection: 'required',
      automatic_tax: {
        enabled: true,
      }
    })

    return NextResponse.json({ id: session.id });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error creating Checkout Session:', err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
