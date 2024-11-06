import { NextRequest, NextResponse } from "next/server";
import schema from "../schema";
import dbConnect from "@/app/lib/dbConnect";
import Customer from "@/app/models/Customer";

// Adding a new customer
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const validation = schema.safeParse(body);

        // Check if the request body matches expected schema
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
        }

        const newCustomer = await Customer.create(body); // for creating a customer

        return NextResponse.json(newCustomer, { status: 201 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error in POST /api/customers:", err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

// Editing information of an existing user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.errors }, { status: 400 });
        }

        const existingCustomer = await Customer.findById(params.id);
        if (!existingCustomer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 }); // Change: Updated "User" to "Customer"
        }
        
        existingCustomer.first_name = body.first_name ?? existingCustomer.first_name;
        existingCustomer.last_name = body.last_name ?? existingCustomer.last_name;
        existingCustomer.email = body.email ?? existingCustomer.email;
        existingCustomer.phone_number = body.phone_number ?? existingCustomer.phone_number; // Original code with field updates

        await existingCustomer.save();

        return NextResponse.json(existingCustomer, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error in PUT /api/customers/[id]:", err); // Change: Added detailed logging
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

// Retrieve info of an existing user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const customer = await Customer.findById(params.id);

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error in GET /api/customers/[id]:", err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

// Delete an existing user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const existingCustomer = await Customer.findById(params.id);
        if (!existingCustomer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        await Customer.deleteOne({ _id: params.id });

        return NextResponse.json({ message: `Customer ${existingCustomer.email} deleted successfully` }, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Error in DELETE /api/customers/[id]:", err);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}