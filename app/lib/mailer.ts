// app/lib/mailer.ts
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


export const sendEmail = async (
    to: string | null | undefined, // Recipient's email address
    subject: string, // Subject line of the email
    html: string // Body text of the email
): Promise<void> => {
    // Check if the recipient's email address is provided
    if (!to) {
        throw new Error('Email address is required'); // Throw an error if no email address is provided
    }

    try {
        // Ensure the transporter is initialized and ready to send emails
        if (!transporter) {
            throw new Error('Transporter is not defined'); // Throw an error if transporter is not set up
        }

        // Use the transporter to send an email with the specified details
        await transporter.sendMail({
            from: process.env.EMAIL_USER, // Sender's email address
            to, // Recipient's email address
            subject: "New Contact Form Submission", // Subject line of the email
            html, // Body text of the email
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
};

