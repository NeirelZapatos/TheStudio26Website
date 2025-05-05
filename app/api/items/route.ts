import { NextRequest, NextResponse } from "next/server";
import { itemSchema } from "@/app/api/common/productSchema";
import dbConnect from "@/app/lib/dbConnect";
import Item from "@/app/models/Item";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(request: NextRequest) {
      const session = await getServerSession(authOptions);
      if (!session) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  //protect
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
      //console.log("Price filter set:", filter.price);
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

    // Jewelry Type filter
    const jewelryTypes = searchParams.get("jewelry_type");
    if (jewelryTypes && jewelryTypes !== "") {
      filter.jewelry_type = { $in: jewelryTypes.split(",") };
    }

    const metalType = searchParams.get("metal_type");
    if (metalType && metalType !== "") {
      filter.metal_type = { $in: metalType.split(",") };
    }

    const metalPurity = searchParams.get("metal_purity");
    if (metalPurity && metalPurity !== "") {
      filter.metal_purity = { $in: metalPurity.split(",") };
    }

    const customizationOptions = searchParams.get("customization_options");
    if (customizationOptions && customizationOptions !== "") {
      filter.customization_options = {
        $in: customizationOptions.split(","),
      };
    }
    const clarity = searchParams.get("clarity");
    if (clarity && clarity !== "") {
      filter.clarity = { $in: clarity.split(",") };
    }
    const cutCategory = searchParams.get("cut_category");
    if (cutCategory && cutCategory !== "") {
      filter.cut_category = { $in: cutCategory.split(",") };
    }
    const certificationAvailable = searchParams.get("certification_available");
    if (certificationAvailable && certificationAvailable !== "") {
      filter.certification_available = {
        $in: certificationAvailable.split(","),
      };
    }
    const essentialsType = searchParams.get("essentials_type");
    if (essentialsType && essentialsType !== "") {
      filter.essentials_type = {
        $in: essentialsType.split(","),
      };
    }
    const semiPreciousBeryl = searchParams.get("semi_precious_beryl");
    if (semiPreciousBeryl && semiPreciousBeryl !== "") {
      filter.semiPreciousBeryl = {
        $in: semiPreciousBeryl.split(","),
      };
    }
    const organicGem = searchParams.get("organic_gem");
    if (organicGem && organicGem !== "") {
      filter.organicGem = {
        $in: organicGem.split(","),
      };
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

    //console.log("Applied filters:", JSON.stringify(filter, null, 2));
    //console.log("Applied sort:", sort);

    // // Debug query before execution
    // const query = Item.find(filter).sort(sort);
    // console.log("MongoDB query:", query.getFilter());

    // const items = await query;
    // console.log(`Found ${items.length} items matching criteria`);

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
