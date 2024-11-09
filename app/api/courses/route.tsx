import { NextRequest, NextResponse } from 'next/server';
import schema from './schema';
import dbConnect from '@/app/lib/dbConnect';
import Course from '@/app/models/Course';

export async function GET(request: NextRequest){
    try {
        await dbConnect();

        const courses = await Course.find({});
        return NextResponse.json(courses);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        // body.order_date = new Date(body.order_date);
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const newCourse = new Course(body);
        await newCourse.save();

        return NextResponse.json(newCourse, { status: 201 });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}