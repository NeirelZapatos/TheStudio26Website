import dbConnect from '@/app/lib/dbConnect';
import bcrypt from 'bcrypt';
import Customer from '@/app/models/Customer';
import { NextRequest, NextResponse } from 'next/server';
import schema from './schema';

// This adds a customer to the database
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate the request body using the schema
        const validation = schema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.errors }, {
                status: 400
            });
        }

        await dbConnect();

        // Check if a customer with the provided email already exists
        const customer = await Customer.findOne({ email: body.email });

        if (customer) {
            // Return an error if the customer already exists
            return NextResponse.json(
                { error: "Customer already exists" },
                { status: 400 }
            );
        }

        // Create a new customer object (hashed password logic kept for potential future use)
        const newCustomer = new Customer({
            "first_name": body.first_name,
            "last_name": body.last_name,
            "email": body.email,
            // "hashed_password": hashed_password, // Not required for current scope
            "phone_number": body.phone_number,
        });

        // Save the new customer to the database
        await newCustomer.save();

        // Return a response with the new customer's email and status 201 (Created)
        return NextResponse.json({ email: newCustomer.email }, { status: 201 });

    } catch (err: unknown) {
        // Handle any errors that occur during the operation
        if (err instanceof Error) {
            console.error("Error in POST /api/customers:", err); // Added for better debugging
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        // Catch-all for unknown errors
        return NextResponse.json({ error: 'An Unknown error occurred' }, { status: 500 });
    }
}

// This gets all the customers in the database
export async function GET(request: NextRequest) {
    try {
        // Connect to the database
        await dbConnect();

        // Retrieve all customers from the database
        const customers = await Customer.find({});
        return NextResponse.json(customers);

    } catch (err: unknown) {
        // Handle any errors that occur during the GET operation
        if (err instanceof Error) {
            console.error("Error in GET /api/customers:", err); // Added for better debugging
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        // Catch-all for unknown errors
        return NextResponse.json({ error: 'An Unknown error occurred' }, { status: 500 });
    }
}

// This deletes a customer from the database
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        // Connect to the database
        await dbConnect();

        // Find the customer by ID
        const existingCustomer = await Customer.findById(params.id);
        if (!existingCustomer) {
            // Return a 404 status if the customer is not found
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        }

        // Delete the customer
        await Customer.deleteOne({ _id: params.id });

        // Return a success message
        return NextResponse.json({ message: `Customer ${existingCustomer.email} deleted successfully` }, { status: 200 });

    } catch (err: unknown) {
        // Handle any errors that occur during the DELETE operation
        if (err instanceof Error) {
            console.error("Error in DELETE /api/customers/[id]:", err); // Added for better debugging
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        // Catch-all for unknown errors
        return NextResponse.json({ error: 'An Unknown error occurred' }, { status: 500 });
    }
}