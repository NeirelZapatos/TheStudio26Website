// app/api/contacts/route.tsx

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/mailer";

export async function POST(request: NextRequest) {
    let body;
    
    // Step 1: Parsing JSON body
    try {
        body = await request.json();
        console.log("Parsed request body:", body); // Log the parsed body to verify content
    } catch (err) {
        console.error("Error parsing request body:", err);
        return NextResponse.json({ error: 'Failed to parse request body' }, { status: 400 });
    }

    // Step 2: Composing the email content
    let emailContent;
    try {
        emailContent = `
        <h1 style="font-weight: bold;">New contact form submission:</h1>
        <p style="font-size: 18px; margin: 0;"><strong>First Name:</strong> ${body.firstName || 'N/A'}</p>
        <p style="font-size: 18px; margin: 0;"><strong>Last Name:</strong> ${body.lastName || 'N/A'}</p>
        <p style="font-size: 18px; margin: 0;"><strong>Email:</strong> ${body.email || 'N/A'}</p>
        <p style="font-size: 18px; margin: 0;"><strong>Phone:</strong> ${body.phone || 'N/A'}</p>
        <p style="font-size: 18px; margin: 10px 0;"><strong>Subject:</strong> ${body.subject || 'N/A'}</p>
          <p style="font-size: 18px; margin: 10px 0;">
        <span style="font-weight: bold;">Message:</span> ${body.message || 'N/A'}
        </p>
        `;
        console.log("Email content prepared successfully.");
    } catch (err) {
        console.error("Error composing email content:", err);
        return NextResponse.json({ error: 'Failed to compose email content' }, { status: 500 });
    }

    // Step 4: Sending email
    try {
        await sendEmail(
            process.env.EMAIL_USER, // Recipient's email address
            "New Contact Form Submission", // Email subject remains fixed
            emailContent
        );
        console.log("Email sent successfully.");
        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } catch (err) {
        console.error("Error sending email:", err);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
