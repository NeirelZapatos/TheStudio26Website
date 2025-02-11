import { NextRequest, NextResponse } from 'next/server';
import { itemSchema } from "@/app/api/common/productSchema";
import dbConnect from '@/app/lib/dbConnect';
import Item from '@/app/models/Item';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        // Log the received body to verify its contents
        console.log("Received in /api/products:", body);

        const validation = itemSchema.safeParse(body);

        if (!validation.success) {
            console.error("Validation Error: " + JSON.stringify(validation.error.errors, null, 2));
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const checkProduct = await Item.findOne({ name: body.name });

        if (checkProduct) {
            console.error("Duplicate product error: Product already exists");
            return NextResponse.json({ error: 'Product already exists' }, { status: 409 });
        }

        const newProduct = new Item(body);
        await newProduct.save();

        console.log("New product saved to MongoDB:", newProduct);
        return NextResponse.json(newProduct, { status: 201 });

    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error saving product to MongoDB:", err.message);
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        // Connect to the database
        await dbConnect();

        // Retrieve all Item from the database
        const items = await Item.find({});
        return NextResponse.json(items);

    } catch (err: unknown) {
        // Handle any errors that occur during the GET operation
        if (err instanceof Error) {
            console.error("Error in GET /api/items:", err); // Added for better debugging
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        // Catch-all for unknown errors
        return NextResponse.json({ error: 'An Unknown error occurred' }, { status: 500 });
    }
}
