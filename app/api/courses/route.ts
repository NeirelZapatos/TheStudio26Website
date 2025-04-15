import { NextRequest, NextResponse } from "next/server";
import { courseSchema } from "@/app/api/common/productSchema";
import dbConnect from "@/app/lib/dbConnect";
import Course from "@/app/models/Course";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        // Log the received body to verify its contents
        console.log("Received in /api/courses:", body);

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

        return NextResponse.json({ error: 'An Unknown error occurred' }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const filter: any = {};

        // Log the incoming request parameters for debugging
        console.log("Search params:", Object.fromEntries(searchParams.entries()));

        // Price filter
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Class category filter - using case-insensitive regex for better matching
        const class_category = searchParams.get("class_category");
        if (class_category && class_category !== "all") {
            filter.class_category = { $regex: new RegExp(class_category, "i") };
        }

        // Sorting
        let sort = {};
        const sortParam = searchParams.get("sort");
        if (sortParam) {
            switch (sortParam) {
                case "price-asc":
                    sort = { price: 1 };
                    break;
                case "price-desc":
                    sort = { price: -1 };
                    break;
                default:
                    sort = {};
            }
        }

        console.log("MongoDB filter:", filter);
        console.log("MongoDB sort:", sort);

        const courses = await Course.find(filter).sort(sort);
        console.log(`Found ${courses.length} courses matching the criteria`);
        
        return NextResponse.json(courses);
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error in GET /api/courses:", err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An Unknown error occurred' }, { status: 500 });
    }
}