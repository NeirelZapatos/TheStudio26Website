import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import NewsletterConfig from '@/app/models/NewsletterConfig';

export async function GET() {
  try {
    await dbConnect();
    
    // Get or create default config
    let config = await NewsletterConfig.findOne({ type: 'monthly' });
    
    if (!config) {
      config = await NewsletterConfig.create({
        type: 'monthly',
        dayOfMonth: 1,
        hour: 9,
        minute: 0,
        active: true
      });
    }
    
    return NextResponse.json({ config }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to get newsletter config', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();
    
    // Validate input (simplified for brevity)
    if (data.dayOfMonth && (data.dayOfMonth < 1 || data.dayOfMonth > 31)) {
      return NextResponse.json(
        { message: 'Day of month must be between 1 and 31' },
        { status: 400 }
      );
    }
    
    // Get or create config
    let config = await NewsletterConfig.findOne({ type: 'monthly' });
    
    if (!config) {
      config = await NewsletterConfig.create({
        type: 'monthly',
        ...data,
        updatedAt: new Date()
      });
    } else {
      // Update existing config
      config.dayOfMonth = data.dayOfMonth ?? config.dayOfMonth;
      config.hour = data.hour ?? config.hour;
      config.minute = data.minute ?? config.minute;
      config.active = data.active ?? config.active;
      config.updatedBy = data.updatedBy || 'admin';
      config.updatedAt = new Date();
      
      await config.save();
    }
    
    return NextResponse.json({ config }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to update newsletter config', error: (error as Error).message },
      { status: 500 }
    );
  }
}