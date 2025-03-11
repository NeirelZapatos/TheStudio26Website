import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/app/lib/dbConnect";
import EmailTemplate from '@/app/models/EmailTemplate';

export async function GET(request: NextRequest) {
  await dbConnect();
  
  try {
    // Simple query to get all templates
    const templates = await EmailTemplate.find()
      .sort({ updatedAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: templates
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const template = await EmailTemplate.create(body);
    
    return NextResponse.json(
      { success: true, data: template },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
