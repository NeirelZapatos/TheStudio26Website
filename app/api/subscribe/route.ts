import { NextResponse } from 'next/server';
import Subscriber from '@/app/models/Subscriber';
import dbConnect from '@/app/lib/dbConnect';

export async function POST(request: Request) {
    await dbConnect();
  
    try {
      const { email } = await request.json();
      
      const existing = await Subscriber.findOne({ email });
    
      // Check for existing subscription (active or inactive)
      if (existing) {
        if (existing.active) {
          return NextResponse.json(
            { error: 'Already subscribed' },
            { status: 400 }
          );
        }
        // Reactivate existing subscription
        existing.active = true;
        await existing.save();
        return NextResponse.json(
          { message: 'Resubscription successful' },
          { status: 200 }
        );
      }
  
      // Create new subscription
      const subscriber = await Subscriber.create({ email });
      return NextResponse.json(
        { message: 'Subscription successful', subscriber },
        { status: 201 }
      );
    } catch (error) {
      console.error('Subscription error:', error);
      return NextResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    }
  }