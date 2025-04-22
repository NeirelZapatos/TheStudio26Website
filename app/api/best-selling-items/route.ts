import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/dbConnect";
import Order from "@/app/models/Order";
import Item from "@/app/models/Item";
import Course from "@/app/models/Course";
import { start } from "repl";

/*
 - API Route: Fetch top 3 best-selling items per category
*/

export async function GET(request:NextRequest) {
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
        //const validCategories = ["Courses", "Jewelry", "Stones", "Supplies"];
        const validCategories = ["Courses", "Jewelry", "Stones", "Essentials"]; // Supplies --> Essentials update

        //Orders from Date Range
        const orders = await Order.find({
            order_date: {
                $gte: startDate,
                $lte: endDate
            }
        });

        const itemSales: Record<string, { name: string; category: string; sales: number }> = {};
        const courseSales: Record<string, { name: string; sales: number }> = {};

        //Sales per Item Processing
        for (const order of orders) {
            for (const productId of order.product_items) {
                const product = await Item.findById(productId);

                if (!product) continue;

                if (!itemSales[productId]) {
                    itemSales[productId] = {
                      name: product.name,
                      category: product.category,
                      sales: 0
                    };
                  }                  

                itemSales[productId].sales += 1;
            }

            for (const courseId of order.course_items) {
                const course = await Course.findById(courseId);

                if (!course) continue;

                if (!courseSales[courseId])
                    courseSales[courseId] = { name: course.name, sales: 0 };

                courseSales[courseId].sales += 1;
            }
        }

        //Sorting Items
        const sortedJewelry = Object.values(itemSales)
            .filter(item => item.category === "Jewelry")
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3);

        const sortedStones = Object.values(itemSales)
            .filter(item => item.category === "Stones")
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3);

        const sortedEssentials = Object.values(itemSales)
            .filter(item => item.category === "Essentials")
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3);

        const sortedCourses = Object.values(courseSales)
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 3);

        return NextResponse.json({
            bestSellingItems: {
                "Jewelry": sortedJewelry,
                "Stones": sortedStones,
                "Essentials": sortedEssentials,
                "Courses": sortedCourses
            }
        }, { status: 200 })

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "An unknown error occured" }, { status: 500 });
    }
}