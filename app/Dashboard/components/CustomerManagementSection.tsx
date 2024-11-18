import React, { useState, useEffect } from "react";

interface Customer {
  _id?: string; // Make _id optional
  first_name: string;
  last_name: string;
  email: string;
}

interface Order {
  _id: string;
  customer_id: string;
  product_items: string[];
  total_amount: number;
  shipping_method: string;
  payment_method: string;
  order_status: string;
  shipping_address: string;
  billing_address: string;
  order_date: string;
}

const CustomerManagementSection: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<{ [key: string]: Order[] }>({});
  const [newCustomer, setNewCustomer] = useState<Customer>({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeInterval, setTimeInterval] = useState("1_month");
  const [loading, setLoading] = useState(false);

  // Fetch customers based on filter criteria
  const fetchCustomers = async () => {
    setLoading(true);
    let query = `/api/customers?`;
    if (searchQuery) query += `search=${encodeURIComponent(searchQuery)}&`; // Add encodeURIComponent for safety
    if (dateRange.start) query += `start=${dateRange.start}&`;
    if (dateRange.end) query += `end=${dateRange.end}&`;
    if (timeInterval) query += `interval=${timeInterval}&`;
  
    try {
      const response = await fetch(query);
      if (!response.ok) throw new Error("Failed to fetch customers.");
      const data = await response.json();
      if (searchQuery) {
        // Filter results locally if needed (depends on server implementation)
        const filteredData = data.filter(
          (customer: Customer) =>
            customer.email.includes(searchQuery) ||
            `${customer.first_name} ${customer.last_name}`
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
        setCustomers(filteredData);
      } else {
        setCustomers(data);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]); // Clear customers in case of an error
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders for a specific customer
  const fetchOrders = async (customerId: string) => {
    try {
      const response = await fetch(`/api/orders`);
      if (!response.ok) throw new Error("Failed to fetch orders.");
      const data = await response.json();
      let customerOrders = []
      for(let i = 0; i < data.length; i++) {
        if(data[i].customer_id == customerId) {
          customerOrders.push(data[i])
        }
      }
      setOrders((prev) => ({ ...prev, [customerId]: customerOrders }));
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleFilterApply = () => {
    fetchCustomers();
  };

  const handleNewCustomerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

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
        setNewCustomer({ first_name: "", last_name: "", email: "" }); // Reset form
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

  const handleShowOrders = (customerId: string) => {
    if (!orders[customerId]) {
      fetchOrders(customerId);
    } else {
      setOrders((prev) => {
        const updatedOrders = { ...prev };
        delete updatedOrders[customerId];
        return updatedOrders;
      });
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
        </div>
        <button
          onClick={addCustomer}
          className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Customer"}
        </button>
      </div>

      {/* Filtering UI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Search by Name or Email
          </label>
          <input
            type="text"
            placeholder="Enter name or email"
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
      </div>
      <button
        onClick={handleFilterApply}
        className="bg-blue-500 text-white py-2 px-4 rounded-lg"
      >
        Apply Filters
      </button>

      {/* Customer List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Customer List</h3>
        <ul>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <li key={customer._id} className="p-4 border-b border-gray-300">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {customer.first_name} {customer.last_name} - {customer.email}
                    </p>
                  </div>
                  <div className="space-x-2">
                    {/* Show/Hide Orders Button */}
                    <button
                      onClick={() => handleShowOrders(customer._id!)}
                      className="mt-2 bg-blue-500 text-white py-1 px-3 rounded-lg"
                    >
                      {orders[customer._id!] ? "Hide Orders" : "Show Orders"}
                    </button>
                    {/* Delete Customer Button */}
                    <button
                      onClick={() => deleteCustomer(customer._id!)}
                      className="mt-2 bg-red-500 text-white py-1 px-3 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Display Orders */}
                {orders[customer._id!] && (
                  <div className="mt-4">
                    <h4 className="text-md font-semibold mb-2">Orders:</h4>
                    <ul className="list-disc pl-6">
                      {orders[customer._id!].map((order) => (
                        <li key={order._id} className="mb-2">
                          <p>
                            <strong>Order ID:</strong> {order._id}
                          </p>
                          <p>
                            <strong>Order Date:</strong>{" "}
                            {new Date(order.order_date).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Status:</strong> {order.order_status}
                          </p>
                          <p>
                            <strong>Total Amount:</strong> $
                            {order.total_amount.toFixed(2)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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