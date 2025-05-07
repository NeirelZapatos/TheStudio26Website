import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import Order from "@/app/models/Order";
import Item from "@/app/models/Item";
import Course from "@/app/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

function generateTimeBuckets(timeFrame: string, start: Date, end: Date): string[] {
  const buckets: string[] = [];
  const date = new Date(start);

  while (date <= end) {
    if (timeFrame === "Yearly") {
      buckets.push(`${date.getFullYear()}`);
      date.setFullYear(date.getFullYear() + 1);
    } else if (timeFrame === "Quarterly") {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      buckets.push(`${date.getFullYear()}-Q${quarter}`);
      date.setMonth(date.getMonth() + 3);
    } else if (timeFrame === "Monthly") {
      buckets.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
      date.setMonth(date.getMonth() + 1);
    } else { // Daily
      buckets.push(date.toISOString().split("T")[0]);
      date.setDate(date.getDate() + 1);
    }
  }

  return buckets;
}

function getBucketKey(date: Date, timeFrame: string): string {
  if (timeFrame === "Yearly") {
    return `${date.getFullYear()}`;
  } else if (timeFrame === "Quarterly") {
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `${date.getFullYear()}-Q${quarter}`;
  } else if (timeFrame === "Monthly") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  } else {
    return date.toISOString().split("T")[0];
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDateString = searchParams.get("startDate");
  const endDateString = searchParams.get("endDate");
  const timeFrame = searchParams.get("timeFrame") || "Monthly";

  const startDate = startDateString ? new Date(startDateString) : new Date("1970-01-01");
  const endDate = endDateString ? new Date(endDateString) : new Date();

  try {
    await dbConnect();

    const timeBuckets = generateTimeBuckets(timeFrame, startDate, endDate);
    const categories = ["Courses", "Jewelry", "Stones", "Essentials"];
    const categorySales: Record<string, Record<string, number>> = {};

    // Initialize every category and bucket with 0
    for (const category of categories) {
      categorySales[category] = {};
      for (const bucket of timeBuckets) {
        categorySales[category][bucket] = 0;
      }
    }

    const orders = await Order.find({ order_date: { $gte: startDate, $lte: endDate } });

    for (const order of orders) {
      const bucketKey = getBucketKey(new Date(order.order_date), timeFrame);

      // Log for debugging
      console.log("Order Date:", order.order_date, "Bucket:", bucketKey);

      for (const courseId of order.course_items) {
        const course = await Course.findById(courseId);
        if (!course) continue;
        categorySales["Courses"][bucketKey] ??= 0;
        categorySales["Courses"][bucketKey] += Number(course.price);
      }

      for (const productId of order.product_items) {
        const item = await Item.findById(productId);
        if (!item) continue;
        const category = item.category;
        if (categorySales[category]) {
          categorySales[category][bucketKey] ??= 0;
          categorySales[category][bucketKey] += Number(item.price);
        }
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