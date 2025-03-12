import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/app/lib/dbConnect";
import EmailTemplate from '@/app/models/EmailTemplate';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid ID format' },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const template = await EmailTemplate.findById(id);
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid ID format' },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const body = await request.json();
    const template = await EmailTemplate.findByIdAndUpdate(
      id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Validate ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid ID format' },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const template = await EmailTemplate.findByIdAndDelete(id);
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}