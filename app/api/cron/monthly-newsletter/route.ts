import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/app/lib/dbConnect';
import Subscriber from '@/app/models/Subscriber';
import Course from '@/app/models/Course';
import NewsletterConfig from '@/app/models/NewsletterConfig';

// Add Vercel Cron config
export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Get courses for the upcoming month
async function getUpcomingCourses(month: number, year: number) {
  try {
    await dbConnect();
    
    // Create date range for the target month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of the month
    
    // Fetch courses that fall within the target month
    const courses = await Course.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 }); // Sort by date ascending
    
    return courses;
  } catch (error) {
    console.error('Error fetching upcoming courses:', error);
    return [];
  }
}

// This function will generate the newsletter content based on upcoming courses
export async function generateMonthlyNewsletter() {
  // Get the current date information
  const now = new Date();
  const currentMonth = now.getMonth();
  const nextMonth = (currentMonth + 1) % 12;
  const year = nextMonth === 0 ? now.getFullYear() + 1 : now.getFullYear();
  
  // Format month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get courses for the upcoming month
  const upcomingCourses = await getUpcomingCourses(nextMonth, year);
  
  // Generate the email subject
  const subject = `${monthNames[nextMonth]} ${year} Classes Newsletter`;
  
  // Generate the email content with HTML formatting
  let content = `
    <h1>Upcoming Classes for ${monthNames[nextMonth]} ${year}</h1>
    <p>We're excited to share our upcoming classes for next month!</p>
  `;
  
  if (upcomingCourses.length === 0) {
    content += `<p>We don't have any classes scheduled for ${monthNames[nextMonth]} yet. Stay tuned for updates!</p>`;
  } else {
    content += `<h2>Classes Available:</h2><ul>`;
    
    upcomingCourses.forEach(course => {
      // Format date for display
      const courseDate = new Date(course.date).toLocaleDateString();
      
      content += `
        <li>
          <h3>${course.name}</h3>
          <p><strong>Date:</strong> ${courseDate}</p>
          <p><strong>Price:</strong> $${course.price.toFixed(2)}</p>
          <p>${course.description}</p>
          <p><a href="${process.env.BASE_URL}/courses/${course._id}">More details and registration</a></p>
        </li>
      `;
    });
    
    content += `</ul>`;
  }
  
  content += `
    <p>We hope to see you in one of our classes!</p>
    <p>Best regards,<br>Your Organization Team</p>
  `;
  
  return { subject, content };
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get newsletter configuration
    const config = await NewsletterConfig.findOne({ type: 'monthly' });
    
    // If no config exists or newsletter is not active, don't send
    if (!config || !config.active) {
      return NextResponse.json(
        { message: 'Monthly newsletter is not active' },
        { status: 200 }
      );
    }
    
    // Check if today is the configured day to send
    const now = new Date();
    
    // Only send if today matches the configured day of month
    if (now.getDate() !== config.dayOfMonth) {
      return NextResponse.json(
        { message: 'Not scheduled to send newsletter today' },
        { status: 200 }
      );
    }
    
    // Check if the current hour matches the configured hour
    if (now.getHours() !== config.hour) {
      return NextResponse.json(
        { message: 'Not the configured hour to send newsletter' },
        { status: 200 }
      );
    }
    
    // Check if the current minute is within a reasonable range of the configured minute
    // This allows for some flexibility in when the CRON job executes
    const currentMinute = now.getMinutes();
    if (Math.abs(currentMinute - config.minute) > 15) {
      return NextResponse.json(
        { message: 'Not the configured time to send newsletter' },
        { status: 200 }
      );
    }
    
    // Check if we already sent the newsletter today
    if (config.lastSent) {
      const lastSent = new Date(config.lastSent);
      // If already sent today, don't send again
      if (
        lastSent.getDate() === now.getDate() &&
        lastSent.getMonth() === now.getMonth() &&
        lastSent.getFullYear() === now.getFullYear()
      ) {
        return NextResponse.json(
          { message: 'Newsletter already sent today' },
          { status: 200 }
        );
      }
    }
    
    // Generate the newsletter content
    const { subject, content } = await generateMonthlyNewsletter();
    
    // Get all active subscribers
    const subscribers = await Subscriber.find({ active: true });
    
    // No subscribers? Return early
    if (subscribers.length === 0) {
      return NextResponse.json(
        { message: 'No active subscribers found' },
        { status: 200 }
      );
    }
    
    // Send the newsletter to each subscriber
    for (const subscriber of subscribers) {
      const unsubscribeLink = `${process.env.BASE_URL}/unsubscribe/${subscriber.unsubscribeToken}`;
      
      const emailContent = `
        ${content}
        <p style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; font-size: 12px; color: #666;">
          You received this email because you're subscribed to our monthly newsletter.
          <br>
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
    
    // Update the lastSent date in the config
    config.lastSent = new Date();
    await config.save();
    
    return NextResponse.json(
      { message: 'Monthly newsletter sent successfully to ' + subscribers.length + ' subscribers!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending monthly newsletter:', error);
    return NextResponse.json(
      { message: 'Failed to send monthly newsletter', error: (error as Error).message },
      { status: 500 }
    );
  }
}