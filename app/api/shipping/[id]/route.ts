import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import Shipping from '@/app/models/Shipping';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const shippingRecord = await Shipping.findById(params.id).populate('order_id');
        
        if (!shippingRecord) {
            return NextResponse.json({ error: 'Shipping record not found' }, { status: 404 });
        }

        return NextResponse.json(shippingRecord);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const body = await request.json();
        const { status, message } = body;

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        const updatedShipping = await Shipping.findByIdAndUpdate(
            params.id,
            { 
                $push: { 
                    status_history: { 
                        status, 
                        message: message || '', 
                        date: new Date() 
                    } 
                },
                $set: { 'transaction.status': status }
            },
            { new: true }
        );

        if (!updatedShipping) {
            return NextResponse.json({ error: 'Shipping record not found' }, { status: 404 });
        }

        return NextResponse.json(updatedShipping);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();

        const shippingRecord = await Shipping.findById(params.id);
        
        if (!shippingRecord) {
            return NextResponse.json({ error: 'Shipping record not found' }, { status: 404 });
        }

        await Shipping.deleteOne({ _id: params.id });
        
        return NextResponse.json(
            { message: `Shipping record with id: ${params.id} deleted successfully` },
            { status: 200 }
        );
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}