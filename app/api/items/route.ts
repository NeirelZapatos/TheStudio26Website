import { NextRequest, NextResponse } from "next/server";
import { itemSchema } from "@/app/api/common/productSchema";
import dbConnect from "@/app/lib/dbConnect";
import Item from "@/app/models/Item";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    console.log("Received in /api/products:", body);

    const validation = itemSchema.safeParse(body);

    if (!validation.success) {
      console.error(
        "Validation Error:",
        JSON.stringify(validation.error.errors, null, 2)
      );
      return NextResponse.json(validation.error.errors, { status: 400 });
    }

    const checkProduct = await Item.findOne({ name: body.name });

    if (checkProduct) {
      console.error("Duplicate product error: Product already exists");
      return NextResponse.json(
        { error: "Product already exists" },
        { status: 409 }
      );
    }

    const newProduct = new Item(body);
    await newProduct.save();

    console.log("New product saved to MongoDB:", newProduct);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error saving product to MongoDB:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An Unknown error occurred" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get the URL search params
    const { searchParams } = new URL(request.url);

    // Build the filter object
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

    // Color filter
    const colors = searchParams.get("color");
    if (colors && colors !== "") {
      filter.color = { $in: colors.split(",") };
    }

    // Material filter
    const materials = searchParams.get("material");
    if (materials && materials !== "") {
      filter.material = { $in: materials.split(",") };
    }

    // Size filter
    const sizes = searchParams.get("size");
    if (sizes && sizes !== "") {
      filter.size = { $in: sizes.split(",") };
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

    // console.log("Applied filters:", filter);
    // console.log("Applied sort:", sort);

    const items = await Item.find(filter).sort(sort);
    return NextResponse.json(items);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in GET request:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An Unknown error occurred" },
      { status: 500 }
    );
  }
}
