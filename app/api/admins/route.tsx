import dbConnect from '@/app/lib/dbConnect';
import bcrypt from 'bcrypt';
import Admin from '@/app/models/Admin';
import { NextRequest, NextResponse } from 'next/server';
import schema from './schema';

// Example JSON to send to this endpoint
// {
//     "email": "admin@example.com",
//     "password": "hashedPasswordHere123"
// }
  
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

        const admin = await Admin.findOne({
            email: body.email
        });

        if (admin) {
            return NextResponse.json(
                { error: "Admin already exists" },
                { status: 400 }
            );
        }

        const hashed_password = await bcrypt.hash(body.password, 10);

        const newAdmin = new Admin({
            "email": body.email,
            "hashed_password": hashed_password,
            "resetPasswordToken": null,
            "resetPasswordExpires": null
        })

        await newAdmin.save();

        return NextResponse.json({ email: newAdmin.email }, { status: 201 });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}

// This gets all the admins
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const admins = await Admin.find({}, { email: 1 });
        return NextResponse.json(admins);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}



