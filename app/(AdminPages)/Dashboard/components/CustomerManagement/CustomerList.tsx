import React from "react"; // Import React
import OrderList from "./OrderList"; // Import OrderList component to display orders for each customer
import { User, Mail, Phone, Archive, Trash2 } from 'lucide-react';


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
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Customer List</h3>

      {customers.length > 0 ? (
        <div className="space-y-4">
          {customers.map((customer) => (
            <div 
              key={customer._id} 
              className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <User className="text-blue-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {customer.first_name} {customer.last_name}
                    </h4>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{customer.email}</span>
                      {customer.phone_number && (
                        <>
                          <Phone className="w-4 h-4 ml-3" />
                          <span className="text-sm">{customer.phone_number}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleShowOrders(customer._id)}
                    className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition"
                    title={orders[customer._id] ? "Hide Orders" : "Show Orders"}
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteCustomer(customer._id)}
                    className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {orders[customer._id] && (
                <OrderList
                  orders={orders[customer._id]}
                  orderCategory={orderCategory}
                  setOrderCategory={setOrderCategory}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 italic">No customers found.</p>
      )}
    </div>
  );
};

export default CustomerList;