import React from "react"; // Import React
import OrderItem from "./OrderItem"; // Import OrderItem component to display individual orders

/**
 * OrderList Component:
 * Displays a list of orders for a specific customer, filtered by the selected category ("all", "classes", or "products").
 * 
 * Props:
 * - orders: Array of order objects to display.
 * - orderCategory: Current filter category for orders ("all", "classes", or "products").
 * - setOrderCategory: Function to update the order category filter.
 */
interface OrderListProps {
  orders: any[]; // Array of order objects
  orderCategory: "all" | "classes" | "products"; // Current order category filter
  setOrderCategory: (category: "all" | "classes" | "products") => void; // Function to update the order category
}

const OrderList: React.FC<OrderListProps> = ({ orders, orderCategory, setOrderCategory }) => {
  // Filter orders based on the selected category
  const filteredOrders = orders.filter((order) => {
    if (orderCategory === "classes") return order.course_items?.length > 0; // Show only orders with classes
    if (orderCategory === "products") return order.products?.length > 0; // Show only orders with products
    return true; // Show all orders if no category is selected
  });

  return (
    <div className="mt-4">
      {/* Section Title */}
      <h4 className="text-md font-semibold mb-2">Orders:</h4>

      {/* Order Category Filter Buttons */}
      <div className="flex gap-2 mb-3">
        {/* "All" Button */}
        <button
          onClick={() => setOrderCategory("all")} // Set order category to "all"
          className={`px-3 py-1 rounded-lg ${
            orderCategory === "all" ? "bg-blue-500 text-white" : "bg-gray-200" // Apply active/inactive styles
          }`}
        >
          All
        </button>

        {/* "Classes" Button */}
        <button
          onClick={() => setOrderCategory("classes")} // Set order category to "classes"
          className={`px-3 py-1 rounded-lg ${
            orderCategory === "classes" ? "bg-blue-500 text-white" : "bg-gray-200" // Apply active/inactive styles
          }`}
        >
          Classes
        </button>

        {/* "Products" Button */}
        <button
          onClick={() => setOrderCategory("products")} // Set order category to "products"
          className={`px-3 py-1 rounded-lg ${
            orderCategory === "products" ? "bg-blue-500 text-white" : "bg-gray-200" // Apply active/inactive styles
          }`}
        >
          Products
        </button>
      </div>

      {/* Check if there are filtered orders to display */}
      {filteredOrders.length > 0 ? (
        <ul className="list-disc pl-6">
          {/* Map through filtered orders and render each one using OrderItem */}
          {filteredOrders.map((order) => (
            <OrderItem key={order._id} order={order} orderCategory={orderCategory} />
          ))}
        </ul>
      ) : (
        // Display a message if no orders are found for the selected category
        <p className="text-gray-500 italic">No orders found for this category.</p>
      )}
    </div>
  );
};

export default OrderList; // Export the OrderList component