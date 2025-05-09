import { NextRequest, NextResponse } from "next/server";
import { itemSchema } from "@/app/api/common/productSchema";
import Item from '@/app/models/Item';
import dbConnect from '@/app/lib/dbConnect';
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";


export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
          const session = await getServerSession(authOptions);
          if (!session) {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }
    //protect maybe not
    try {
        await dbConnect();

        const body = await request.json();
        // console.log("Received request body:", body); // Log the request body for troubleshooting
        
        const validation = itemSchema.safeParse(body);

        if (!validation.success) {
            console.log("Validation failed:", validation.error.errors);
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const existingProduct = await Item.findById(params.id);
        if(!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        Object.assign(existingProduct, body);

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
    //protect
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = params;

        // Find and delete the item by its Stripe ID in MongoDB
        const deletedItem = await Item.findByIdAndDelete(id);

        if (!deletedItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item deleted from MongoDB', product: deletedItem });
    } catch (error) {
        console.error('Error deleting item from MongoDB:', error);
        return NextResponse.json({ error: 'Failed to delete item from MongoDB' }, { status: 500 });
    }
}

// First Route: GET order by ID
export async function GET(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();

        const product = await Item.findById(params.id);

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Include image_url in the response
        return NextResponse.json(product);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}
