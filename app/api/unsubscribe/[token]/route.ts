import { NextResponse } from "next/server";
import Subscriber from "@/app/models/Subscriber";
import dbConnect from "@/app/lib/dbConnect";

export async function DELETE(
    request: Request,
    { params }: { params: { token: string } }
) {
    await dbConnect();

    try {
        const { token } = params;
        const subscriber = await Subscriber.findOneAndDelete({
            unsubscribeToken: token
        });

        if (!subscriber) {
            return NextResponse.json(
                { error: 'Invalid unsubscribe link' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Successfully unsubscribed'},
            { status: 200 }  
        );
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return NextResponse.json(
            { error: 'Failed to unsubscribe'},
            { status: 500 }
        );
    }
}