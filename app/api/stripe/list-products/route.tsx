import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(request: NextRequest) {
  try {
      const { searchParams } = new URL(request.url);
      const active = searchParams.get('active') === 'true';

      // Retrieve only active products if `active` is true
      const products = await stripe.products.list({
          active: active || undefined,
      });

      return NextResponse.json(products.data);
  } catch (error) {
      console.error('Error listing products:', error);
      return NextResponse.json(
          { error: 'Failed to retrieve products' },
          { status: 500 }
      );
  }
}