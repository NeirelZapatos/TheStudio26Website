import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcrypt';
import schema from "../schema";
import dbConnect from "@/app/lib/dbConnect";
import Admin from '@/app/models/Admin';
import { authOptions } from "../../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";


// editing information of an existing user
export async function PUT(request: NextRequest, { params }: { params: { id: number }}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();

        const body = await request.json();
        const validation = schema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(validation.error.errors, { status: 400 })
        }

        const existingAdmin = await Admin.findById(params.id);
        if (!existingAdmin) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })

        }

        existingAdmin.email = body.email ?? existingAdmin.email;
        existingAdmin.hashed_password = await bcrypt.hash(body.password, 10) ?? existingAdmin.hashed_password;

        await existingAdmin.save();

        return NextResponse.json(existingAdmin, { status: 200 });        
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err); // Log the error
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}

// gets a specific user
export async function GET(request: NextRequest, { params }: { params: { id: number } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        await dbConnect();

        const admin = await Admin.findById(params.id, { email: 1 });

        if (!admin) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(admin);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 })
        }

        return NextResponse.json({ error: 'An Unkown error occurred' }, { status: 500 })
    }
}

// deletes a specific user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();

        if (params.id === process.env.MASTER_ADMIN_ID) {
            return NextResponse.json({ error: 'Cannot delete the master admin user' }, { status: 403 });
        }

        const existingAdmin = await Admin.findById(params.id);
        if(!existingAdmin) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })

        }

        await Admin.deleteOne({ _id: params.id });
    
        return NextResponse.json({ message: `Admin: ${existingAdmin.email} deleted successfully`}, { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err); // Log the error
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
}
