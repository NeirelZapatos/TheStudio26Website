import React from "react"; // Import React
import OrderList from "./OrderList"; // Import OrderList component to display orders for each customer

/**
 * CustomerList Component:
 * Displays a list of customers with their details and options to show/hide their orders or delete them.
 * 
 * Props:
 * - customers: Array of customer objects to display in the list.
 * - orders: Object mapping customer IDs to their respective orders.
 * - orderCategory: Current filter category for orders ("all", "classes", or "products").
 * - setOrderCategory: Function to update the order category filter.
 * - handleShowOrders: Function to toggle the visibility of orders for a specific customer.
 * - deleteCustomer: Function to delete a customer by their ID.
 */
interface CustomerListProps {
  customers: any[]; // Array of customer objects
  orders: { [key: string]: any[] }; // Object mapping customer IDs to their orders
  orderCategory: "all" | "classes" | "products"; // Current order category filter
  setOrderCategory: (category: "all" | "classes" | "products") => void; // Function to update the order category
  handleShowOrders: (customerId: string) => void; // Function to show/hide orders for a customer
  deleteCustomer: (customerId: string) => void; // Function to delete a customer
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  orders,
  orderCategory,
  setOrderCategory,
  handleShowOrders,
  deleteCustomer,
}) => {
  return (
    <div className="mt-6">
      {/* Section Title */}
      <h3 className="text-lg font-semibold mb-4">Customer List</h3>

      {/* Check if there are customers to display */}
      {customers.length > 0 ? (
        <ul>
          {/* Map through each customer and render their details */}
          {customers.map((customer) => (
            <li key={customer._id} className="p-4 border-b border-gray-300">
              {/* Customer Details */}
              <div className="flex justify-between items-center">
                {/* Display customer name, email, and phone number (if available) */}
                <p className="font-medium">
                  {customer.first_name} {customer.last_name} - {customer.email}
                  {customer.phone_number && ` - ${customer.phone_number}`}
                </p>

                {/* Buttons for showing/hiding orders and deleting the customer */}
                <div className="space-x-2">
                  {/* Show/Hide Orders Button */}
                  <button
                    onClick={() => handleShowOrders(customer._id)} // Toggle orders visibility for this customer
                    className="mt-2 bg-blue-500 text-white py-1 px-3 rounded-lg"
                  >
                    {orders[customer._id] ? "Hide Orders" : "Show Orders"} 
                  </button>

                  {/* Delete Customer Button */}
                  <button
                    onClick={() => deleteCustomer(customer._id)} // Delete the customer
                    className="mt-2 bg-red-500 text-white py-1 px-3 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Render OrderList if orders are visible for this customer */}
              {orders[customer._id] && (
                <OrderList
                  orders={orders[customer._id]} // Pass the customer's orders
                  orderCategory={orderCategory} // Pass the current order category filter
                  setOrderCategory={setOrderCategory} // Pass the function to update the order category
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        // Display a message if no customers are found
        <p>No customers found with the current filters.</p>
      )}
    </div>
  );
};

export default CustomerList; // Export the CustomerList component