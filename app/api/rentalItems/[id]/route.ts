import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import RentalItem from "@/app/models/RentalItem";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const item = await RentalItem.findById(params.id);
    if (!item) {
      return NextResponse.json({ error: "Rental item not found." }, { status: 404 });
    }
    return NextResponse.json(item, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error fetching rental item:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}

// PUT: Update a rental item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();

    // Minimal validation
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        { error: "Name is required and must be a string." },
        { status: 400 }
      );
    }
    if (typeof body.price !== "number") {
      return NextResponse.json(
        { error: "Price is required and must be a number." },
        { status: 400 }
      );
    }

    const item = await RentalItem.findById(params.id);
    if (!item) {
      return NextResponse.json({ error: "Rental item not found." }, { status: 404 });
    }

    // Update fields
    item.name = body.name;
    item.price = body.price;

    await item.save();
    return NextResponse.json(item, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error updating rental item:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}

// DELETE: Delete a rental item by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const deletedItem = await RentalItem.findByIdAndDelete(params.id);
    if (!deletedItem) {
      return NextResponse.json({ error: "Rental item not found." }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Rental item deleted successfully.", item: deletedItem },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error deleting rental item:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}