import { NextRequest, NextResponse } from "next/server";
import schema from "../schema";
import dbConnect from "@/app/lib/dbConnect";
import Customer from '@/app/models/Customer';

// editing information of an existing user
export async function PUT(request: NextRequest, { params }: { params: { id: number }}) {
    try {
        await dbConnect();

        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const existingCustomer = await Customer.findById(params.id);
        if(!existingCustomer) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })

        }

        existingCustomer.first_name = body.first_name ?? existingCustomer.first_name;
        existingCustomer.last_name = body.last_name ?? existingCustomer.last_name;
        existingCustomer.email = body.email ?? existingCustomer.email;
        existingCustomer.phone_number = body.phone_number ?? existingCustomer.phone_number;

        await existingCustomer.save();

        return NextResponse.json(existingCustomer, { status: 200 });        
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

        const customer = await Customer.findById(params.id);

        if (!customer) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(customer);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();

        const existingCustomer = await Customer.findById(params.id);
        if(!existingCustomer) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })

        }

        await Customer.deleteOne({ _id: params.id });
    
        return NextResponse.json({ message: `Customer ${existingCustomer.email} deleted successfully`}, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err); // Log the error
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

