import React, { useState, useEffect } from "react";

interface Customer {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  order_number?: string;
  purchase_type?: string;
  date?: string;
}

const CustomerManagementSection: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    order_number: "",
    purchase_type: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeInterval, setTimeInterval] = useState("1_month");
  const [purchaseType, setPurchaseType] = useState("");

  // Fetch customers based on filter criteria
  const fetchCustomers = async () => {
    let query = `/api/customers?`;
    if (searchQuery) query += `search=${searchQuery}&`;
    if (dateRange.start) query += `start=${dateRange.start}&`;
    if (dateRange.end) query += `end=${dateRange.end}&`;
    if (timeInterval) query += `interval=${timeInterval}&`;
    if (purchaseType) query += `type=${purchaseType}&`;

    try {
      const response = await fetch(query);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleFilterApply = () => {
    fetchCustomers();
  };

  // Handle input change for new customer form
  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new customer to the database
  const addCustomer = async () => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      });

      if (response.ok) {
        const addedCustomer = await response.json();
        setCustomers((prev) => [...prev, addedCustomer]); // Add the new customer to the list
        setNewCustomer({
          first_name: "",
          last_name: "",
          email: "",
          order_number: "",
          purchase_type: "",
        }); // Reset form
        alert("Customer added successfully!");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.errors
          ? errorData.errors.map((e: any) => e.message).join(", ")
          : errorData.error || "Unknown error";
        alert(`Failed to add customer: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("An unexpected error occurred.");
    }
  };

  // Delete a customer from the database
  const deleteCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCustomers((prev) => prev.filter((customer) => customer._id !== id));
        alert("Customer deleted successfully!");
      } else {
        alert("Failed to delete customer.");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Customer Management</h2>

      {/* Add New Customer Form */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-4">Add New Customer</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="first_name"
            placeholder="First Name"
            value={newCustomer.first_name}
            onChange={handleNewCustomerChange}
            className="p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="last_name"
            placeholder="Last Name"
            value={newCustomer.last_name}
            onChange={handleNewCustomerChange}
            className="p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newCustomer.email}
            onChange={handleNewCustomerChange}
            className="p-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            name="order_number"
            placeholder="Order Number"
            value={newCustomer.order_number}
            onChange={handleNewCustomerChange}
            className="p-2 border border-gray-300 rounded-lg"
          />
          <select
            name="purchase_type"
            value={newCustomer.purchase_type}
            onChange={handleNewCustomerChange}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select Purchase Type</option>
            <option value="class">Class Booking</option>
            <option value="store">Online Store Item</option>
          </select>
        </div>
        <button
          onClick={addCustomer}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          Add Customer
        </button>
      </div>

      {/* Filtering UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Search by Name, Email, or Order Number
          </label>
          <input
            type="text"
            placeholder="Enter name, email, or order number"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Date Range
          </label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded-lg mb-2"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
          />
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Time Interval
          </label>
          <select
            value={timeInterval}
            onChange={(e) => setTimeInterval(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="1_month">1 Month</option>
            <option value="3_months">3 Months</option>
            <option value="6_months">6 Months</option>
            <option value="1_year">1 Year</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Purchase Type
          </label>
          <select
            value={purchaseType}
            onChange={(e) => setPurchaseType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          >
            <option value="">All</option>
            <option value="class">Class Bookings</option>
            <option value="store">Online Store Items</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleFilterApply}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg"
      >
        Apply Filters
      </button>

      {/* Customer Data Display */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Customer List</h3>
        <ul>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <li key={customer._id} className="p-4 border-b border-gray-300">
                <p className="font-medium">
                  {customer.first_name} {customer.last_name} - {customer.email}
                </p>
                <p>Order Number: {customer.order_number}</p>
                <p>Purchase Type: {customer.purchase_type}</p>
                <p>Date: {customer.date}</p>
                <button
                  onClick={() => deleteCustomer(customer._id)}
                  className="text-red-500 mt-2"
                >
                  Delete
                </button>
              </li>
            ))
          ) : (
            <p>No customers found with the current filters.</p>
          )}
        </ul>
      </div>
    </section>
  );
};

export default CustomerManagementSection;