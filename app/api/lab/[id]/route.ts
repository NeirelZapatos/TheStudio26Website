import { NextRequest, NextResponse } from "next/server";
// import { courseSchema } from "@/app/api/common/productSchema";
import dbConnect from "@/app/lib/dbConnect";
import Lab from "@/app/models/Lab";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    //maybe not protect
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        await dbConnect();

        const body = await request.json();
        // console.log("Received request body:", body); // Log the request body for troubleshooting
        
        // const validation = labSchema.safeParse(body);

        // if (!validation.success) {
        //     console.log("Validation failed:", validation.error.errors);
        //     return NextResponse.json(validation.error.errors, { status: 400 })
        // }

        const existingProduct = await Lab.findById(params.id);
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
    //protect
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const { id } = params;

        // Log the ID being used for deletion for troubleshooting
        console.log("Attempting to delete lab with Stripe ID:", id);

        // Find and delete the lab by its Stripe ID in MongoDB
        const deletedlab = await Lab.findOneAndDelete({ stripeProductId: id });

        if (!deletedlab) {
            return NextResponse.json({ error: 'lab not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'lab deleted from MongoDB', product: deletedlab });
    } catch (error) {
        console.error('Error deleting lab from MongoDB:', error);
        return NextResponse.json({ error: 'Failed to delete lab from MongoDB' }, { status: 500 });
    }
}


export async function GET(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();


        const product = await Lab.findById(params.id);

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