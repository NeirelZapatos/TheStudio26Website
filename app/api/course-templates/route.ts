import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import ClassTemplate from '@/app/models/CourseTemplate';

export async function GET() {
  await dbConnect();
  try {
    // Fetch all class templates from the MongoDB collection
    const templates = await ClassTemplate.find({})
      .sort({ updatedAt: -1 });
    
    return NextResponse.json(
      { success: true, data: templates },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching class templates:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    
    const template = await ClassTemplate.create(body);
    return NextResponse.json(
      { success: true, data: template },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving class template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}