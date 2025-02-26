import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/app/lib/dbConnect';
import Subscriber from '@/app/models/Subscriber';

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
    await dbConnect();

    const { subject, content } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { message: 'Subject and content are required' },
        { status: 400 }
      );
    }

    const subscribers = await Subscriber.find({ active: true });
    for (const subscriber of subscribers) {
      const unsubscribeLink = `${process.env.BASE_URL}/unsubscribe/${subscriber.unsubscribeToken}`;

      const emailContent = `
        ${content}
        <p style="margin-top: 20px;">
          <a href="${unsubscribeLink}">Unsubscribe from future emails</a>
        </p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: subscriber.email,
        subject: subject,
        html: emailContent,
      });
    }
    
    return NextResponse.json(
      { message: 'Newsletter sent successfully to ' + subscribers.length + ' subscribers!' },
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