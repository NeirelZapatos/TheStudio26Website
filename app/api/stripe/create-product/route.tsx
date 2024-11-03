import { NextResponse } from 'next/server';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);


export async function POST(req: Request) {
 try {
   const data = await req.json(); // Extract the data sent from the frontend
   const product = await stripe.products.create({
     name: data.name || 'Sample Product',
     description: data.description || 'A sample product created via API',
   });


   return NextResponse.json(product);
 } catch (error) {
   console.error('Error creating product:', error);
   return new NextResponse(JSON.stringify({ error: 'Failed to create product', details: error }), { status: 500 });
 }
}



