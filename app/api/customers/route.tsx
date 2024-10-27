import dbConnect from '@/app/lib/dbConnect';
import bcrypt from 'bcrypt';
import Customer from '@/app/models/Customer';
import { NextRequest, NextResponse } from 'next/server';
import schema from './schema';

// This adds a customer to the database
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validation = schema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(validation.error.errors, {
                status: 400
            })
        }

        await dbConnect();

        const customer = await Customer.findOne({
            email: body.email
        });

        if (customer) {
            return NextResponse.json(
                { error: "Customer already exists" },
                { status: 400 }
            );
        }

        // const hashed_password = await bcrypt.hash(body.password, 10); // not required for scope

        const newCustomer = new Customer({
            "first_name": body.first_name,
            "last_name": body.last_name,
            "email": body.email,
            // "hashed_password": hashed_password, // not required for scope
            "phone_number": body.phone_number,
        })

        await newCustomer.save();

        return NextResponse.json({ email: newCustomer.email }, { status: 201 });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}

// This gets all the customers in the database
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const customers = await Customer.find({});
        return NextResponse.json(customers);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}


