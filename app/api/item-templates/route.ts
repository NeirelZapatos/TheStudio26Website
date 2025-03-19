import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import ItemTemplate from '@/app/models/ItemTemplate';

export async function GET() {
  await dbConnect();

  try {
    // Fetch all item templates from the MongoDB collection
    const templates = await ItemTemplate.find({})
      .sort({ updatedAt: -1 });

    return NextResponse.json(
      { success: true, data: templates },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching templates:', error);
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

    const template = await ItemTemplate.create(body);

    return NextResponse.json(
      { success: true, data: template },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}