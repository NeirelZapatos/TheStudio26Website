import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import Order from "@/app/models/Order";
import Item from "@/app/models/Item";
import Course from "@/app/models/Course";

function generateSalesTrend(
  startDate: string,
  endDate: string,
  timeframe: string
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const delta =
    timeframe === "Yearly"
      ? 365
      : timeframe === "Quarterly"
      ? 90
      : timeframe === "Monthly"
      ? 30
      : 1;

  const salesData: Record<string, { date: string; revenue: number }[]> = {
    Courses: [],
    Jewelry: [],
    Stones: [],
    Supplies: [],
  };

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + delta)) {
    const formattedDate = d.toISOString().split("T")[0];
    for (const category in salesData) {
      salesData[category].push({
        date: formattedDate,
        revenue: parseFloat(
          (Math.random() * 1000 + 100).toFixed(2)
        ), // Mock revenue
      });
    }
  }

  return salesData;
}

// API Route
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const timeframe = searchParams.get("timeFrame") || "Daily";

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Missing startDate or endDate" },
      { status: 400 }
    );
  }

  try {
    const data = generateSalesTrend(startDate, endDate, timeframe);

    return NextResponse.json({ salesTrends: data }, { status: 200 });
  } catch (err) {
    console.error("Error generating sales trend:", err);
    return NextResponse.json(
      { error: "Failed to generate sales trend" },
      { status: 500 }
    );
  }
}