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
import { searchCustomers } from '@/utils/searchUtils';
import { useState, useEffect } from 'react';

const formatPhoneNumber = (phoneNumber: string) => {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]})${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
};

interface CustomerListProps {
  customers: any[]; // Array of customer objects
  orders: { [key: string]: any[] }; // Object mapping customer IDs to their orders
  orderCategory: "all" | "classes" | "products"; // Current order category filter
  setOrderCategory: (category: "all" | "classes" | "products") => void; // Function to update the order category
  handleShowOrders: (customerId: string) => void; // Function to show/hide orders for a customer
  deleteCustomer: (customerId: string) => void; // Function to delete a customer
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers: initialCustomers,
  orders,
  orderCategory,
  setOrderCategory,
  handleShowOrders,
  deleteCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState(initialCustomers);

  // Update filtered customers when search query or initial customers change
  useEffect(() => {
    const normalizedQuery = searchQuery.trim();
    const filtered = searchCustomers(initialCustomers, normalizedQuery);
    setFilteredCustomers(filtered);
  }, [searchQuery, initialCustomers]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Customer List</h3>

      {/* Search Bar - Now with functional search */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search by name or email"
          className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
          value={searchQuery}
          onChange={(e) => {
            const sanitizedQuery = e.target.value.replace(/\s+/g, ' ');
            setSearchQuery(sanitizedQuery);
          }}
          autoComplete="off"
        />
      </div>

      {filteredCustomers.length > 0 ? (
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
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
                    <div className="flex flex-col text-gray-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                      {customer.phone_number && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">
                            {formatPhoneNumber(customer.phone_number)}
                          </span>
                        </div>
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
        <p className="text-center text-gray-500 italic">
          {searchQuery ? "No matching customers found." : "No customers found."}
        </p>
      )}
    </div>
  );
};

export default CustomerList;