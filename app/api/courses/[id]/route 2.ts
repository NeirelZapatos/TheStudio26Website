import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import Course from "@/app/models/Course";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const { id } = params;

        // Log the ID being used for deletion for troubleshooting
        console.log("Attempting to delete course with Stripe ID:", id);

        // Find and delete the course by its Stripe ID in MongoDB
        const deletedCourse = await Course.findOneAndDelete({ stripeProductId: id });

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