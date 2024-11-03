import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Named export for DELETE method
export async function DELETE(req: Request) {
    try {
      const { id } = await req.json(); // Expecting the product ID to be sent in the request body
      if (!id) {
        return NextResponse.json(
          { error: 'Product ID is required' },
          { status: 400 }
        );
      }
  
      // Delete the product from Stripe
      const deletedProduct = await stripe.products.del(id);
      return NextResponse.json(deletedProduct);
    } catch (error) {
      console.error('Error deleting product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return NextResponse.json(
        { error: 'Failed to delete product', details: errorMessage },
        { status: 500 }
      );
    }
  }