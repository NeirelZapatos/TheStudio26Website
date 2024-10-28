import { NextRequest, NextResponse } from "next/server";
import schema from "../schema";
import Product from '@/app/models/Product';
import dbConnect from '@/app/lib/dbConnect';

export async function PUT(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();

        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const existingProduct = await Product.findById(params.id);
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

export async function DELETE(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();

        const existingProduct = await Product.findById(params.id);
        if(!existingProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })

        }

        await Product.deleteOne({ _id: params.id });
    
        return NextResponse.json({ message: `Product named ${existingProduct.name} deleted successfully`}, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err); // Log the error
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

export async function GET(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();


        const product = await Product.findById(params.id);

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