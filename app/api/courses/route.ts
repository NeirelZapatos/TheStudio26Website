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

        // const checkProduct = await Course.findOne({ name: body.name });

        // if (checkProduct) {
        //     console.error("Duplicate product error: Product already exists");
        //     return NextResponse.json({ error: 'Product already exists' }, { status: 409 });
        // }

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

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get the URL search params
        const { searchParams } = new URL(request.url);

        const filter: any = {};

        // Price filter (convert string to number for comparison)
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Category filter
        const category = searchParams.get("category");
        if (category && category !== "all") {
            filter.category = category; // Filter by category if not "all"
        }

        // Class Type Filter
        const classType = searchParams.get("classType");
        if (classType && classType !== "") {
            filter.classType = { $in: classType.split(",") };
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

        console.log("Applied filters:", filter);
        console.log("Applied sort:", sort);

        const courses = await Course.find(filter).sort(sort);
        return NextResponse.json(courses);
    } catch (err: unknown) {
        // Handle any errors that occur during the GET operation
        if (err instanceof Error) {
            console.error("Error in GET /api/courses:", err); // Added for better debugging
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        // Catch-all for unknown errors
        return NextResponse.json({ error: 'An Unknown error occurred' }, { status: 500 });
    }
}
