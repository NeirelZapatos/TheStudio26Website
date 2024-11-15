import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const archivedProduct = await stripe.products.update(id, { active: false });
    return NextResponse.json(archivedProduct);
  } catch (error) {
    console.error('Error archiving product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to archive product', details: errorMessage },
      { status: 500 }
    );
  }
}
