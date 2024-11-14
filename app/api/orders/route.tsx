import { NextRequest, NextResponse } from 'next/server';
import schema from './schema';
import dbConnect from '@/app/lib/dbConnect';
import Order from '@/app/models/Order';

// Example of JSON to send to this api endpoint
// {
//     "customer_id": "671ef81602098f94990d0c0f",
//     "product_items": ["671d62eb17058eb97e7c7f4e", "671d630017058eb97e7c7f52"],
//     "total_amount": 150.60,
//     "shipping_method": "Ground",
//     "payment_method": "Credit Card",
//     "order_status": "pending",
//     "shipping_address": "123 Main St, Springfield",
//     "billing_address": "123 Main St, Springfield"
//  }

export async function GET(request: NextRequest){
    try {
        await dbConnect();

        const orders = await Order.find({});
        return NextResponse.json(orders);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        body.order_date = new Date();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const newOrder = new Order(body);
        await newOrder.save();

        return NextResponse.json(newOrder, { status: 201 });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}