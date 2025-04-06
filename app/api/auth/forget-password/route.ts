import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import Admin from "@/app/models/Admin";
import crypto from "crypto";
import bcrypt from 'bcrypt';

require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    logger: true, // Enable logging
    debug: true,  // Enable debug output
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        console.log("Received email:", email);

        await dbConnect();

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return NextResponse.json({ error: "No account found with that email address" }, { status: 404 });
        }

        const token = crypto.randomBytes(20).toString("hex");
        const hashed_token = await bcrypt.hash(token, 10);

        admin.resetPasswordToken = hashed_token;
        admin.resetPasswordExpires = new Date(Date.now() + 600000);

        await admin.save();

        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ResetPassword?token=${token}`;
        
        try {
            // Ensure the transporter is initialized and ready to send emails
            if (!transporter) {
                throw new Error('Transporter is not defined'); // Throw an error if transporter is not set up
            }

            // Use the transporter to send an email with the specified details
            await transporter.sendMail({
                from: process.env.EMAIL_USER, // Sender's email address
                to: email, // Recipient's email address
                subject: "Reset Password", // Subject line of the email
                html: `
                    <p>You requested a password reset.</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>This link will expire in 10 minutes.</p>
                `, // Body text of the email
            });

            // Log a success message if the email is sent without issues
            console.log('Email sent successfully');
        } catch (error) {
            // Log an error message if sending the email fails
            console.error('Error sending email:', error);

            // Re-throw the error for further handling
            if (error instanceof Error) {
                throw error; // If the error is an instance of Error, re-throw it
            } else {
                throw new Error('Failed to send email'); // Throw a generic error if the caught error is not an instance of Error
            }
        }

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
