import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import ClassTemplate from '@/app/models/CourseTemplate';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    const deletedTemplate = await ClassTemplate.findByIdAndDelete(id);
    
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