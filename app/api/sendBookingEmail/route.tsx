import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/mailer";
import dbConnect from "@/app/lib/dbConnect";
import RentalItem from "@/app/models/RentalItem";

export async function POST(request: NextRequest) {
  let body;

  try {
    body = await request.json();
    console.log("Parsed lab booking body:", body);
  } catch (err) {
    console.error("Error parsing request body:", err);
    return NextResponse.json(
      { error: "Failed to parse request body" },
      { status: 400 }
    );
  }

  let emailContent;
  try {
    let equipmentList = "None";
    if (body.selectedItems && body.selectedItems.length > 0) {
      await dbConnect();
      const items = await RentalItem.find({ _id: { $in: body.selectedItems } });
      if (items.length > 0) {
        const itemNames = items.map((item) => item.name);
        equipmentList = itemNames.join(", ");
      }
    }

    emailContent = `
      <h1 style="font-weight: bold;">New Lab Booking Submission:</h1>
      <p style="font-size: 18px; margin: 0;"><strong>Customer Name:</strong> ${body.customerName || "N/A"}</p>
      <p style="font-size: 18px; margin: 0;"><strong>Lab:</strong> ${body.labName || "N/A"} (ID: ${body.labId || "N/A"})</p>
      <p style="font-size: 18px; margin: 0;"><strong>Booking Date:</strong> ${body.bookingDate || "N/A"}</p>
      <p style="font-size: 18px; margin: 0;"><strong>Participants:</strong> ${body.quantity || "N/A"}</p>
      <p style="font-size: 18px; margin: 0;"><strong>Additional Equipment:</strong> ${equipmentList}</p>
      <p style="font-size: 18px; margin: 10px 0;"><strong>Special Requests / Comments:</strong> ${body.comments || "None"}</p>
      <p style="font-size: 18px; margin: 10px 0;"><strong>Total Price:</strong> $${(body.total || 0).toFixed(2)}</p>
    `;
    console.log("Lab booking email content prepared successfully.");
  } catch (err) {
    console.error("Error composing lab booking email content:", err);
    return NextResponse.json(
      { error: "Failed to compose email content" },
      { status: 500 }
    );
  }

  try {
    const recipient = process.env.OWNER_EMAIL || process.env.EMAIL_USER;
    await sendEmail(recipient, "New Lab Booking Submission", emailContent);
    console.log("Lab booking email sent successfully.");
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error sending lab booking email:", err);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}