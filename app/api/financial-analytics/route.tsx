import { NextRequest, NextResponse } from "next/server";
import dbConnect from '@/app/lib/dbConnect';
import FinancialData from '@/app/models/FinancialAnalytics';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "All Categories";
  const timeFrame = searchParams.get("timeFrame") || "daily"; // Default to 'daily' on page start up

  try {
    await dbConnect();
    const validCategories = ['Courses', 'Jewelry', 'Stones', 'Supplies'];

    // If a specific category is selected, fetch data for that category
    if (category !== "All Categories" && validCategories.includes(category)) {
      const categoryData = await FinancialData.findOne({ category });
      if (!categoryData) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }

      const revenue = categoryData.revenue[timeFrame][0] || 0; // Fetch the selected timeframe revenue

      return NextResponse.json({
        revenue,
        categoryRevenue: {
          [category]: { revenue },
        },
      }, { status: 200 });
    }

    // If 'All Categories' is selected, aggregate revenue across all categories
    const allCategoriesData = await FinancialData.find({ category: { $in: validCategories } });
    const categoryRevenue: { [key: string]: { revenue: number } } = {};
    let totalRevenue = 0;

    allCategoriesData.forEach(catData => {
      const revenue = catData.revenue[timeFrame][0] || 0;
      categoryRevenue[catData.category] = { revenue };
      totalRevenue += revenue;
    });

    return NextResponse.json({
      revenue: totalRevenue,
      categoryRevenue,
    }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "An unknown error occurred" }, { status: 500 });
  }
}

