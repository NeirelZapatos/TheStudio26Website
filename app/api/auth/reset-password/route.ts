import bcrypt from 'bcrypt';
import dbConnect from '@/app/lib/dbConnect';
import Admin from '@/app/models/Admin';
import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    if (request.method !== "POST") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { token, password } = await request.json();

    try {
        await dbConnect();
        // Find all admins with valid (non-expired) tokens
        const admins = await Admin.find({ resetPasswordExpires: { $gt: new Date() } });

        // Find matching admin by comparing token using bcrypt.compare
        let matchingAdmin = null;
        for (const admin of admins) {
            const isMatch = await bcrypt.compare(token, admin.resetPasswordToken);
            if (isMatch) {
                matchingAdmin = admin;
                break;
            }
        }

        if (!matchingAdmin) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const hashed_password = await bcrypt.hash(password, 10);
        console.log(hashed_password);

        matchingAdmin.hashed_password = hashed_password;
        matchingAdmin.resetPasswordToken = null;
        matchingAdmin.resetPasswordExpires = null;

        await matchingAdmin.save();

        // Return success with redirect info
        return NextResponse.json({
            success: true,
            message: "Password was reset",
        });
    } catch (error) {
        console.log("Error in reset-password: ", error);
        return NextResponse.json({
            success: false,
            message: "Something went wrong. Please try again later"
        });
    }
}