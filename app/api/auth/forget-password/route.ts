import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import Admin from "@/app/models/Admin";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required"}, { status: 400 });
        }

        console.log("Received email:", email);

        await dbConnect();

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return NextResponse.json({ error: "No account found with that email address"}, { status: 404 });
        }

        const token = crypto.randomBytes(20).toString("hex");
        admin.resetPasswordToken = token;
        admin.resetPasswordExpires = new Date(Date.now() + 600000);

        await admin.save();

        return NextResponse.json({
            success: true,
            message: `Reset email sent to ${email}`,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }

        return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
}
