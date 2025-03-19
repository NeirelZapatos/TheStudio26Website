import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import ItemTemplate from '@/app/models/ItemTemplate';

export async function GET() {
  await dbConnect(); // Connect to the database

  try {
    // Fetch all item templates from the MongoDB collection
    const templates = await ItemTemplate.find({})
      .sort({ updatedAt: -1 }); // Sort by updatedAt in descending order

    // Return the templates as a JSON response
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