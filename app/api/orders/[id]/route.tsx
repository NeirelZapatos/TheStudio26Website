import { NextRequest, NextResponse } from "next/server";
import schema from "../schema";
import Order from "@/app/models/Order";
import dbConnect from '@/app/lib/dbConnect';

export async function PUT(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();

        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const existingOrder = await Order.findById(params.id);
        if(!existingOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })

        }

        existingOrder.customer_id = body.customer_id ?? existingOrder.customer_id;
        existingOrder.product_items = body.product_items ?? existingOrder.product_items;
        existingOrder.order_date = body.order_date ?? existingOrder.order_date;
        existingOrder.total_amount = body.total_amount ?? existingOrder.total_amount;
        existingOrder.shipping_method = body.shipping_method ?? existingOrder.shipping_method;
        existingOrder.payment_method = body.payment_method ?? existingOrder.payment_method;
        existingOrder.order_status = body.order_status ?? existingOrder.order_status;
        existingOrder.shipping_address = body.shipping_address ?? existingOrder.shipping_address;
        existingOrder.billing_address = body.billing_address ?? existingOrder.billing_address;

        await existingOrder.save();

        return NextResponse.json(existingOrder, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err); // Log the error
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: number } }) {
    try {
        await dbConnect();

        const existingOrder = await Order.findById(params.id);
        if(!existingOrder) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })

        }

        await Order.deleteOne({ _id: params.id });
    
        return NextResponse.json({ message: `Order with id: ${existingOrder._id} deleted successfully`}, { status: 200 });
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

        const order = await Order.findById(params.id);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Return all relevant product fields (name, price, description, etc.)
        return NextResponse.json({
            _id: order._id,
            name: order.name,
            price: order.price,
            description: order.description,
            category: order.category,
            material: order.material,
            image_url: order.image_url,
            size: order.size,
            color: order.color,
            quantity_in_stock: order.quantity_in_stock,
            stripeProductId: order.stripeProductId,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}
