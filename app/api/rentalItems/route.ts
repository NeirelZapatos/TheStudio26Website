import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import RentalItem from "@/app/models/RentalItem";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const items = await RentalItem.find({});
    return NextResponse.json(items, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error fetching rental items:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log("Received in /api/rentalItems:", body);

    // Minimal validation: name must be a string, price must be a number.
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

    // Optionally, check for duplicates.
    const existingItem = await RentalItem.findOne({ name: body.name });
    if (existingItem) {
      return NextResponse.json(
        { error: "Rental item already exists." },
        { status: 409 }
      );
    }

    const newItem = new RentalItem({ name: body.name, price: body.price });
    await newItem.save();
    console.log("New rental item saved:", newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error creating rental item:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}