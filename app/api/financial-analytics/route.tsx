import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import FinancialData from "@/app/models/FinancialAnalytics";
import Item from "@/app/models/Item";
import Course from "@/app/models/Course";
import Order from "@/app/models/Order";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "All Categories";
  const startDateString = searchParams.get("startDate");
  const endDateString = searchParams.get("endDate");
  const startDate = startDateString ? new Date(startDateString) : null;
  const endDate = endDateString ? new Date(endDateString) : null;

  if (startDate && isNaN(startDate.getTime())) {
    return NextResponse.json({ error: "Invalid Start Date" }, { status: 400 });
  }

  if (endDate && isNaN(endDate.getTime())) {
    return NextResponse.json({ error: "Invalid End Date" }, { status: 400 });
  }

  try {
    await dbConnect();
    const validCategories = ['Courses', 'Jewelry', 'Stones', 'Supplies'];

    // If a specific category is selected, fetch data for that category
    // if (category !== "All Categories" && validCategories.includes(category)) {
    //   const categoryData = await FinancialData.findOne({ category });
    //   if (!categoryData) {
    //     return NextResponse.json({ error: "Category not found" }, { status: 404 });
    //   }

    //   const revenue = categoryData.revenue[timeFrame][0] || 0; // Fetch the selected timeframe revenue

    //   return NextResponse.json({
    //     revenue,
    //     categoryRevenue: {
    //       [category]: { revenue },
    //     },
    //   }, { status: 200 });
    // }


    // If 'All Categories' is selected, aggregate revenue across all categories
    const allCategoriesData = await Order.find({
      order_date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    const categoryRevenue: { [key: string]: { revenue: number } } = {};

    let totalRevenue = 0;
    let jewelryRevenue = 0;
    let suppliesRevenue = 0;
    let stonesRevenue = 0;
    let courseRevenue = 0;
    for (const catData of allCategoriesData) {
      totalRevenue += catData.total_amount;
      for (let i = 0; i < catData.product_items.length; i++) {
        const productId = catData.product_items[i];
        const product = await Item.findById(productId); // Await the product fetch

        if (product.category === "Jewelry") {
          jewelryRevenue += product.price;
        } else if (product.category === "Stones") {
          stonesRevenue += product.price;
        } else if (product.category === "Supplies") {
          suppliesRevenue += product.price;
        }
      }
      for (let i = 0; i < catData.course_items.length; i++) {
        const courseId = catData.course_items[i];
        const course = await Course.findById(courseId);
        courseRevenue += course.price;
        console.log(courseRevenue);
      }
    }

    categoryRevenue["Jewelry"] = { revenue: jewelryRevenue };
    categoryRevenue["Stones"] = { revenue: stonesRevenue };
    categoryRevenue["Supplies"] = { revenue: suppliesRevenue };
    categoryRevenue["Courses"] = { revenue: courseRevenue };

    return NextResponse.json({
      revenue: totalRevenue,
      categoryRevenue,
    }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "An unknown error occurred" }, { status: 500 });
  }
  // const { searchParams } = new URL(request.url);
  // const category = searchParams.get("category") || "All Categories";
  // const timeFrame = searchParams.get("timeFrame") || "daily"; // Default to 'daily' on page start up

  // try {
  //   await dbConnect();
  //   const validCategories = ["Courses", "Jewelry", "Stones", "Supplies"];

  //   // If a specific category is selected, fetch data for that category
  //   if (category !== "All Categories" && validCategories.includes(category)) {
  //     const categoryData = await FinancialData.findOne({ category });
  //     if (!categoryData) {
  //       return NextResponse.json(
  //         { error: "Category not found" },
  //         { status: 404 }
  //       );
  //     }

  //     const revenue = categoryData.revenue[timeFrame][0] || 0; // Fetch the selected timeframe revenue

  //     return NextResponse.json(
  //       {
  //         revenue,
  //         categoryRevenue: {
  //           [category]: { revenue },
  //         },
  //       },
  //       { status: 200 }
  //     );
  //   }

  //   // If 'All Categories' is selected, aggregate revenue across all categories
  //   const allCategoriesData = await FinancialData.find({
  //     category: { $in: validCategories },
  //   });
  //   const categoryRevenue: { [key: string]: { revenue: number } } = {};
  //   let totalRevenue = 0;

  //   allCategoriesData.forEach((catData) => {
  //     const revenue = catData.revenue[timeFrame][0] || 0;
  //     categoryRevenue[catData.category] = { revenue };
  //     totalRevenue += revenue;
  //   });

  //   return NextResponse.json(
  //     {
  //       revenue: totalRevenue,
  //       categoryRevenue,
  //     },
  //     { status: 200 }
  //   );
  // } catch (err) {
  //   console.error(err);
  //   return NextResponse.json(
  //     {
  //       error: err instanceof Error ? err.message : "An unknown error occurred",
  //     },
  //     { status: 500 }
  //   );
  // }
}
