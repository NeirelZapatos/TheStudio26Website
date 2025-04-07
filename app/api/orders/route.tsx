import { NextRequest, NextResponse } from 'next/server';
import schema from './schema';
import dbConnect from '../../lib/dbConnect';
import { sendOrderEmail } from "../../lib/mailer";
import Order from '../../models/Order';
import Item from '../../models/Item';
import Course from '../../models/Course';

// Example of JSON to send to this api endpoint
// {
//     "customer_id": "671ef81602098f94990d0c0f",
//     "product_items": ["671d62eb17058eb97e7c7f4e", "671d630017058eb97e7c7f52"],
//     "shipping_method": "Ground",
//     "payment_method": "Credit Card",
//     "order_status": "pending",
//     "shipping_address": "123 Main St, Springfield",
//     "billing_address": "123 Main St, Springfield"
//  }

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("start");
        const endDate = searchParams.get("end");

        const query: any = {};

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            start.setUTCHours(0, 0, 0, 0); // Set start time to beginning of the day
            end.setUTCHours(23, 59, 59, 999); // Set end time to end of the day

            query.order_date = { $gte: start, $lte: end };
        }

        console.log("MongoDB Query:", query);

        const orders = await Order.find(query);
        return NextResponse.json(orders);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An Unknown error occurred' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        // for testing purposes
        body.order_date = new Date(body.order_date);
        body.order_date = new Date();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        let total_amount = 0;
        for(let i = 0; i < body.product_items.length; i++) {
            const productId = body.product_items[i];
            const item = await Item.findById(productId);
            total_amount += item.price;
        }

        for(let i = 0; i < body.course_items.length; i++) {
            const courseId = body.course_items[i];
            const course = await Course.findById(courseId);
            total_amount += course.price;
        }

        body.total_amount = total_amount;

        const newOrder = new Order(body);
        await newOrder.save();

        // Send order confirmation email
        await sendOrderEmail(
            body.customer_email,
            newOrder._id.toString(),
            body.product_items,
            body.course_items,
            //total_amount, //reading it as string despite being input as Number in mailer.ts
            body.order_date
        );

        return NextResponse.json(newOrder, { status: 201 });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { orderIds, order_status } = body;

        // Validate request body
        if (!orderIds || !order_status) {
            return NextResponse.json(
                { error: 'orderIds and order_status are required' },
                { status: 400 }
            );
        }

        // Update multiple orders
        const result = await Order.updateMany(
            { _id: { $in: orderIds } }, // Filter by order IDs
            { $set: { order_status } } // Update order_status
        );

        if (result.modifiedCount === 0) {
            return NextResponse.json(
                { error: 'No orders found or no changes made' },
                { status: 404 }
            );
        }

        // Fetch updated orders
        const updatedOrders = await Order.find({ _id: { $in: orderIds } });

        return NextResponse.json(updatedOrders, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err); // Log the error
            return NextResponse.json(
                { error: err.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'An unknown error occurred' },
            { status: 500 }
        );
    }
}
    