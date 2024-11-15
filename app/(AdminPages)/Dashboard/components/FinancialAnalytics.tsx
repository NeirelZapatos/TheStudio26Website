import React, { useEffect, useState } from "react";

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
    };

    fetchData();
  }, [selectedCategory, timeFrame]);

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
    <section className="bg-gray-900 text-white shadow-lg rounded-lg p-6 my-6">
      <h2 className="text-2xl font-semibold mb-6">Financial Analytics</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Product Category:</h3>
        <div className="flex flex-wrap gap-2">
          {productCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-2 rounded-lg ${
                selectedCategory === category ? "bg-blue-600" : "bg-gray-800"
              } text-white`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Revenue:</h3>
        <div className="flex flex-wrap gap-2">
          {timeFrames.map((frame) => (
            <button
              key={frame}
              onClick={() => setTimeFrame(frame)}
              className={`p-2 rounded-lg ${
                timeFrame === frame ? "bg-blue-600" : "bg-gray-800"
              } text-white`}
            >
              {frame}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col items-center">
            <p className="text-gray-400 mb-1">{timeFrame} Revenue</p>
            <h3 className="text-3xl font-bold">{formatRevenue(financialData.revenue)}</h3>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Product Revenue</h3>
            <div className="space-y-2">
              {Object.entries(financialData.categoryRevenue).map(([category, { revenue }]) => (
                <div
                  key={category}
                  className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
                >
                  <strong>{category}</strong>
                  <span>{formatRevenue(revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Orders</h3>
            <div className="space-y-2">
              {orders.length > 0 ? (
                orders.map((orders) => (
                  <div
                    key={orders._id}
                    className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <strong>{orders.product}</strong>
                      <p className="text-gray-400">{formatRevenue(orders.price)}</p>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-lg"
                        onClick={() => updateOrder(orders)}
                      >
                        Update
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded-lg"
                        onClick={() => deleteOrder(orders)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No orders available.</p>
              )}
              <button
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
                onClick={createOrder}
              >
                Create Order
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default FinancialAnalytics;
