import { NextRequest, NextResponse } from "next/server";
import schema from "../schema";
import dbConnect from '@/app/lib/dbConnect';
import Course from "@/app/models/Course";

export async function PUT(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();

        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const existingCourse = await Course.findById(params.id);
        if(!existingCourse) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })

        }

        existingCourse.name = body.name ?? existingCourse.name; // Update name if provided
        existingCourse.price = body.price ?? existingCourse.price; // Update price if provided
        existingCourse.description = body.description ?? existingCourse.description; // Update description if provided
        existingCourse.date = body.date ?? existingCourse.date; // Update date if provided
        existingCourse.time = body.time ?? existingCourse.time; // Update time if provided
        existingCourse.duration = body.duration ?? existingCourse.duration; // Update duration if provided
        existingCourse.image_url = body.image_url ?? existingCourse.image_url; // Update image_url if provided
        existingCourse.instructor = body.instructor ?? existingCourse.instructor; // Update instructor if provided
        existingCourse.location = body.location ?? existingCourse.location; // Update location if provided
        existingCourse.max_capacity = body.max_capacity ?? existingCourse.max_capacity; // Update max_capacity if provided

        await existingCourse.save();

        return NextResponse.json(existingCourse, { status: 200 });
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

        const existingCourse = await Course.findById(params.id);
        if(!existingCourse) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })

        }

        await Course.deleteOne({ _id: params.id });
    
        return NextResponse.json({ message: `Course named ${existingCourse.name} deleted successfully`}, { status: 200 });
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


        const course = await Course.findById(params.id);

        if (!course) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(course);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}