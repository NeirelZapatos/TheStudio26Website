import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import LabTemplate from '@/app/models/LabTemplate';

export async function GET() {
  await dbConnect();
  try {
    // Fetch all lab templates from the MongoDB collection
    const templates = await LabTemplate.find({})
      .sort({ updatedAt: -1 });
    
    return NextResponse.json(
      { success: true, data: templates },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching lab templates:', error);
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
    
    // Ensure the category is set to "Lab"
    body.category = "Lab";
    
    const template = await LabTemplate.create(body);
    return NextResponse.json(
      { success: true, data: template },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving lab template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}


export async function DELETE(request: Request) {
  await dbConnect();
  
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Template ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const deletedTemplate = await LabTemplate.findByIdAndDelete(id);
    
    if (!deletedTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, data: deletedTemplate },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting class template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}