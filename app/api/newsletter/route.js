import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Hardcoded list of subscribers (replace with database later)
const subscribers = [
  'alexanderrbass@pm.me',
  'wovag83902@intady.com',
];

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    const { subject, content } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { message: 'Subject and content are required' },
        { status: 400 }
      );
    }

    // Send email to each subscriber
    for (const email of subscribers) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: content,
      });
    }

    return NextResponse.json(
      { message: 'Newsletter sent successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json(
      { message: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}