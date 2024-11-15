import { NextRequest, NextResponse } from "next/server";
import { courseSchema } from "@/app/api/common/productSchema";
import dbConnect from "@/app/lib/dbConnect";
import Course from "@/app/models/Course";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        // Log the received body to verify its contents
        console.log("Received in /api/products:", body);

        const validation = courseSchema.safeParse(body);

        if (!validation.success) {
            console.error("Validation Error: " + JSON.stringify(validation.error.errors, null, 2));
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const checkProduct = await Course.findOne({ name: body.name });

        if (checkProduct) {
            console.error("Duplicate product error: Product already exists");
            return NextResponse.json({ error: 'Product already exists' }, { status: 409 });
        }

        const newProduct = new Course(body);
        await newProduct.save();

        console.log("New product saved to MongoDB:", newProduct);
        return NextResponse.json(newProduct, { status: 201 });

    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error saving Course to MongoDB:", err.message);
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}