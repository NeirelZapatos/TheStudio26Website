// might not be used

import { NextRequest, NextResponse } from 'next/server';
import schema from './schema';
import dbConnect from '@/app/lib/dbConnect';
import Course from '@/app/models/Course';

// Example JSON to send to this endpoint
// {
//   "name": "Introduction to Web Development",
//   "price": 299.99,
//   "description": "A comprehensive course covering the fundamentals of web development, including HTML, CSS, and JavaScript.",
//   "time": "10:00 AM",
//   "duration": 4,
//   "image_url": "https://example.com/images/web-development-course.jpg",
//   "instructor": "John Doe",
//   "location": "Room 101, Tech Building",
//   "max_capacity": 30
// }

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
        body.order_date = new Date();
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