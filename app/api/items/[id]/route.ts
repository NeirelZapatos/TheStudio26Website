import { NextRequest, NextResponse } from "next/server";
import { itemSchema } from "@/app/api/common/productSchema";
import Item from '@/app/models/Item';
import dbConnect from '@/app/lib/dbConnect';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const body = await request.json();
        const validation = itemSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const existingProduct = await Item.findById(params.id);
        if(!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })

        }

        existingProduct.name = body.name ?? existingProduct.name; // Update name if provided
        existingProduct.price = body.price ?? existingProduct.price; // Update price if provided
        existingProduct.description = body.description ?? existingProduct.description; // Update description if provided

        await existingProduct.save();

        return NextResponse.json(existingProduct, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err); // Log the error
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const { id } = params;

        // Log the ID being used for deletion for troubleshooting
        console.log("Attempting to delete Item with Stripe ID:", id);

        // Find and delete the item by its Stripe ID in MongoDB
        const deletedItem = await Item.findOneAndDelete({ stripeProductId: id });

        if (!deletedItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item deleted from MongoDB', product: deletedItem });
    } catch (error) {
        console.error('Error deleting item from MongoDB:', error);
        return NextResponse.json({ error: 'Failed to delete item from MongoDB' }, { status: 500 });
    }
}

export async function GET(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();


        const product = await Item.findById(params.id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}