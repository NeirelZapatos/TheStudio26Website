import { NextRequest, NextResponse } from "next/server";
import dbConnect from '../../../lib/dbConnect';
import Order from "../../../models/Order";
import Item from "../../../models/Item";
import Course from "../../../models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";


export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

        // console.log(allCategoriesData);

        for (const catData of allCategoriesData) {
            // totalRevenue += catData.total_amount;

            // console.log(catData.product_items);
            
            // Handle product items
            for (const productId of catData.product_items) {
                const product = await Item.findById(productId);
                
                if (!product) {
                    console.warn(`Product not found for ID: ${productId}`);
                    continue;
                }

                console.log(product.category);

                switch (product.category) {
                    case "Jewelry":
                        jewelryRevenue += Number(product.price);
                        totalRevenue += Number(product.price);
                        break;
                    case "Stones":
                        stonesRevenue += Number(product.price);
                        totalRevenue += Number(product.price);
                        break;
                    case "Supplies":
                        suppliesRevenue += Number(product.price);
                        totalRevenue += Number(product.price);
                        break;
                }
            }

            // Handle course items
            for (const courseId of catData.course_items) {
                const course = await Course.findById(courseId);
                
                if (!course) {
                    console.warn(`Course not found for ID: ${courseId}`);
                    continue;
                }

                courseRevenue += Number(course.price);
                totalRevenue += Number(course.price);
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
}