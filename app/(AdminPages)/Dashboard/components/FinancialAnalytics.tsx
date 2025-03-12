  // 'use client'

  import React, { useEffect, useState } from "react";
  import { Line } from "react-chartjs-2";
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

  interface CategoryRevenue {
    revenue: number;
  }

  interface FinancialData {
    revenue: number;
    categoryRevenue: Record<string, CategoryRevenue>;
  }

  interface Order {
    _id?: string;
    product: string;
    price: number;
    date: string;
  }

  const FinancialAnalytics: React.FC = () => {
    const [financialData, setFinancialData] = useState<FinancialData>({
      revenue: 0,
      categoryRevenue: {},
    });
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");
    const [timeFrame, setTimeFrame] = useState<string>("Daily");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const productCategories = ["All Categories", "Courses", "Jewelry", "Stones", "Supplies"];
    const timeFrames = ["Daily", "Monthly", "Quarterly", "Yearly"];

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `/api/financial-analytics?category=${selectedCategory}&timeFrame=${timeFrame.toLowerCase()}`
          );
          if (!response.ok) throw new Error("Failed to fetch data");
          const data = await response.json();
          setFinancialData(data);
          } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setIsLoading(false);
        }

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const currentDay = new Date().getDate()

        const nextDate = new Date(currentYear, currentMonth, currentDay);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextYear = nextDate.getFullYear();
        const nextMonth = (nextDate.getMonth() + 1).toString().padStart(2, '0');
        const nextDay = nextDate.getDate().toString().padStart(2, '0');

        let startDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${currentDay}`;
        let endDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${nextDay}`;

        if (timeFrame == "Yearly") {
          startDate = `${currentYear}-01-01`;
          endDate = `${currentYear}-12-31`;
        } else if (timeFrame == "Quarterly") {
          const quarterFirstMonth = Math.floor(currentMonth / 3) * 3;
          const quarterLastMonth = quarterFirstMonth + 2;
          startDate = `${currentYear}-${(quarterFirstMonth + 1).toString().padStart(2, '0')}-01`;
          endDate = `${currentYear}-${(quarterLastMonth + 1).toString().padStart(2, '0')}-${new Date(currentYear, quarterLastMonth + 1, 0).getDate()}`;
        } else if (timeFrame == "Monthly") {
          startDate = `${currentYear}-01-01`;
          endDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${new Date(currentYear, currentMonth + 1, 0).getDate().toString().padStart(2, '0')}`;
        } else {

          startDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${currentDay}`;
          endDate = `${nextYear}-${nextMonth}-${nextDay}`;
        }

        console.log(startDate);
        console.log(endDate);


        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(
            `/api/financial-analytics/date-filter?category=${selectedCategory}&startDate=${startDate}&endDate=${endDate}`
          );
          if (!response.ok) throw new Error("Failed to fetch data");
          const data = await response.json();
          setFinancialData(data);
          // setTimeFrame(`${startDate} to ${endDate}`)
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [selectedCategory, timeFrame]);

    // Prepare data for Chart.js
    const revenueChartData = {
      labels: Object.keys(financialData.categoryRevenue),
      datasets: [
        {
          label: "Revenue ($)",
          data: Object.values(financialData.categoryRevenue).map((cat) => cat.revenue),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
        },
      ],
    };

    useEffect(() => {
      const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/orders`);
          if (!response.ok) throw new Error("Failed to fetch orders");
          const orderData = await response.json();
          setOrders(orderData);
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred while fetching orders");
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrders();
    }, []);

    const fetchDataDate = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/financial-analytics/date-filter?category=${selectedCategory}&startDate=${startDate}&endDate=${endDate}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setFinancialData(data);
        // setTimeFrame(`${startDate} to ${endDate}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    const formatRevenue = (value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    };

    const createOrder = () => {
      // Placeholder for creating an order
      console.log("Creating an order...");
    };

    const updateOrder = (order: Order) => {
      // Placeholder for updating an order
      console.log("Updating an order...");
    };

    const deleteOrder = (order: Order) => {
      // Placeholder for deleting an order
      console.log("Deleting an order...");
    };

    return (
      <section className="bg-white text-gray-900 shadow-lg rounded-lg p-6 my-6">
        <h2 className="text-2xl font-semibold mb-6">Financial Analytics</h2>

        {/* Time Frame & Category Selectors */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-gray-600 mb-1">Select Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded-lg"
            >
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Select Time Frame:</label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="p-2 border rounded-lg"
            >
              {timeFrames.map((frame) => (
                <option key={frame} value={frame}>
                  {frame}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Display Revenue Data */}
        {isLoading ? (
          <div className="text-center">Loading data...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            {/* Total Revenue */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md flex flex-col items-center">
              <p className="text-gray-600 mb-1">{timeFrame} Revenue</p>
              <h3 className="text-3xl font-bold">{formatRevenue(financialData.revenue)}</h3>
            </div>

            {/* Revenue Breakdown */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Product Revenue</h3>
              <div className="space-y-2">
                {Object.entries(financialData.categoryRevenue).map(([category, { revenue }]) => (
                  <div key={category} className="bg-gray-200 p-4 rounded-lg flex justify-between items-center">
                    <strong>{category}</strong>
                    <span>{formatRevenue(revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Trend Graph */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
              <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                <Line data={revenueChartData} options={{ responsive: true }} />
              </div>
            </div>
          </>
        )}
      </section>
    );
  };

  export default FinancialAnalytics;