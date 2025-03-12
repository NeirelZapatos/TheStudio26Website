import { NextRequest, NextResponse } from "next/server";
import { courseSchema } from "@/app/api/common/productSchema";
import dbConnect from "@/app/lib/dbConnect";
import Course from "@/app/models/Course";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const body = await request.json();
        // console.log("Received request body:", body); // Log the request body for troubleshooting
        
        const validation = courseSchema.safeParse(body);

        if (!validation.success) {
            console.log("Validation failed:", validation.error.errors);
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const existingProduct = await Course.findById(params.id);
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
    try {
        await dbConnect();
        const { id } = params;
        
        // Find and delete the course by its Stripe ID in MongoDB
        const deletedCourse = await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Course deleted from MongoDB', product: deletedCourse });
    } catch (error) {
        console.error('Error deleting course from MongoDB:', error);
        return NextResponse.json({ error: 'Failed to delete course from MongoDB' }, { status: 500 });
    }
}


export async function GET(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();


        const product = await Course.findById(params.id);

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