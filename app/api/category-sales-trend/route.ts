import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import Order from "@/app/models/Order";
import Item from "@/app/models/Item";
import Course from "@/app/models/Course";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDateString = searchParams.get("startDate");
  const endDateString = searchParams.get("endDate");

  const startDate = startDateString ? new Date(startDateString) : new Date("1970-01-01");
  const endDate = endDateString ? new Date(endDateString) : new Date();

  try {
    await dbConnect();

    const orders = await Order.find({
      order_date: { $gte: startDate, $lte: endDate },
    });

    const categorySales: Record<string, Record<string, number>> = {
      Courses: {},
      Jewelry: {},
      Stones: {},
      Supplies: {},
    };

    for (const order of orders) {
      const month = new Date(order.order_date).toISOString().slice(0, 7); // "YYYY-MM"

      // Courses
      for (const courseId of order.course_items) {
        const course = await Course.findById(courseId);
        if (!course) continue;

        categorySales["Courses"][month] = (categorySales["Courses"][month] || 0) + course.price;
      }

      // Products
      for (const productId of order.product_items) {
        const item = await Item.findById(productId);
        if (!item) continue;

        const category = item.category;
        if (!categorySales[category]) categorySales[category] = {};

        categorySales[category][month] = (categorySales[category][month] || 0) + item.price;
      }
    }

    return NextResponse.json({ categorySales }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}