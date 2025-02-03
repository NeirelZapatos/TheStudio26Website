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
  const [timeInterval, setTimeInterval] = useState("");
  const [loading, setLoading] = useState(false);

  // Function to normalize dates to UTC
  const getUTCDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD in UTC
  };

  const fetchCustomers = async () => {
    setLoading(true);
    let query = `/api/customers?`;
    if (searchQuery) query += `search=${encodeURIComponent(searchQuery)}&`;
    if (timeInterval !== "") query += `interval=${timeInterval}&`;
  
    try {
      console.log("Fetching customers with query:", query);
  
      // Step 1: Fetch Customers Based on Name or Email
      const customerResponse = await fetch(query);
      if (!customerResponse.ok) throw new Error("Failed to fetch customers.");
      const customersData: Customer[] = await customerResponse.json();
  
      console.log("Raw Customers Data:", customersData);
  
      // Step 2: Filter Customers Based on Search Query (Email or Name)
      const filteredCustomers = customersData.filter((customer: Customer) =>
        customer.email.includes(searchQuery) ||
        `${customer.first_name} ${customer.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
  
      console.log("Filtered Customers:", filteredCustomers);
  
      if (filteredCustomers.length === 0) {
        setCustomers([]);
        setOrders({});
        setLoading(false);
        return;
      }
  
      // Step 3: Fetch All Orders
      const orderResponse = await fetch(`/api/orders`);
      if (!orderResponse.ok) throw new Error("Failed to fetch orders.");
      let ordersData: Order[] = await orderResponse.json();
  
      console.log("Raw Orders Data:", ordersData);
  
      // Step 4: Match Orders with Filtered Customers
      const matchedOrders = ordersData.filter((order) =>
        filteredCustomers.some((customer) => customer._id === order.customer_id)
      );
  
      console.log("Matched Orders Before Date Filter:", matchedOrders);
  
      // Step 5: Apply Date Range Filtering (if provided)
      let finalOrders: Order[] = matchedOrders;
  
      if (dateRange.start && dateRange.end) {
        finalOrders = matchedOrders.filter((order: Order) => {
          const orderDateStr = getUTCDate(order.order_date);
          const startDateStr = getUTCDate(dateRange.start);
          const endDateStr = getUTCDate(dateRange.end);
  
          return orderDateStr >= startDateStr && orderDateStr <= endDateStr;
        });
  
        console.log("Final Orders After Date Filtering:", finalOrders);
      }
  
      // Step 6: Organize Orders by Customer ID
      const ordersByCustomer: { [key: string]: Order[] } = {};
      filteredCustomers.forEach((customer) => {
        ordersByCustomer[customer._id!] = finalOrders.filter(
          (order) => order.customer_id === customer._id
        );
      });
  
      console.log("Orders Organized by Customer ID:", ordersByCustomer);
  
      // Step 7: Update State
      setCustomers(filteredCustomers);
      setOrders(ordersByCustomer);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
      setOrders({});
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (customerId: string) => {
    try {
      // Debugging: Log the customer ID being fetched
      console.log("Fetching orders for customer ID:", customerId);

      // Fetch all orders
      const response = await fetch(`/api/orders`);
      if (!response.ok) throw new Error("Failed to fetch orders.");
      let data: Order[] = await response.json();

      // Debugging: Log the raw orders data
      console.log("Raw Orders Data for Customer:", customerId, data);

      // Normalize `order_date` to ensure consistent UTC format
      data = data.map(order => ({
        ...order,
        order_date: getUTCDate(order.order_date), // Use UTC date
      }));

      // Filter orders for the specific customer and date range
      const filteredOrders = data.filter((order: Order) => {
        if (order.customer_id !== customerId) {
          return false;
        }

        if (dateRange.start && dateRange.end) {
          const orderDateStr = order.order_date;
          const startDateStr = getUTCDate(dateRange.start);
          const endDateStr = getUTCDate(dateRange.end);

          // Debugging: Log order date and date range
          console.log("Order Date (UTC):", orderDateStr);
          console.log("Date Range Start (UTC):", startDateStr);
          console.log("Date Range End (UTC):", endDateStr);

          // Compare dates without buffer
          return orderDateStr >= startDateStr && orderDateStr <= endDateStr;
        }

        return true;
      });

      // Debugging: Log the filtered orders
      console.log("Filtered Orders for Customer:", customerId, filteredOrders);

      // Update state with filtered orders
      setOrders((prev) => ({ ...prev, [customerId]: filteredOrders }));
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const handleFilterApply = () => {
    console.log("Applying Filters with Date Range:", dateRange);
    fetchCustomers();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setDateRange({ start: "", end: "" });
    setTimeInterval("");
    setCustomers([]);
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
    // Step 1: Ask for confirmation before proceeding
    const confirmDelete = window.confirm("Are you sure you want to delete this customer? This action cannot be undone.");
  
    if (!confirmDelete) {
      return; // Exit if the user cancels
    }
  
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

  const [orderCategory, setOrderCategory] = useState<"all" | "classes" | "products">("all");

  const handleCategoryChange = (category: "all" | "classes" | "products") => {
    setOrderCategory(category);
  };

  const exportOrdersToCSV = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").split("T").join("_").replace("Z", ""); 
    const filename = `customer_orders_${timestamp}.csv`;
  
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID,Customer Name,Email,Order Date,Total Amount,Status,Items\n";
  
    customers.forEach((customer) => {
      if (orders[customer._id!]) {
        orders[customer._id!].forEach((order) => {
          const items = order.product_items.join(" | ");
          const row = `${order._id},${customer.first_name} ${customer.last_name},${customer.email},${order.order_date},$${order.total_amount.toFixed(2)},${order.order_status},${items}`;
          csvContent += row + "\n";
        });
      }
    });
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
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
            <option value="">Select Interval</option>
            <option value="1_month">1 Month</option>
            <option value="3_months">3 Months</option>
            <option value="6_months">6 Months</option>
            <option value="1_year">1 Year</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <button
          onClick={handleFilterApply}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          Apply Filters
        </button>

        <button
          onClick={handleClearSearch}
          className="bg-gray-500 text-white py-2 px-4 rounded-lg"
        >
          Clear Search
        </button>

        <button
          onClick={exportOrdersToCSV}
          className="bg-green-500 text-white py-2 px-4 rounded-lg"
        >
          Export Orders
        </button>
      </div>
      
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

    {/* Filter Buttons */}
    <div className="flex gap-2 mb-3">
      <button onClick={() => handleCategoryChange("all")} className={`px-3 py-1 rounded-lg ${orderCategory === "all" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
        All
      </button>
      <button onClick={() => handleCategoryChange("classes")} className={`px-3 py-1 rounded-lg ${orderCategory === "classes" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
        Classes
      </button>
      <button onClick={() => handleCategoryChange("products")} className={`px-3 py-1 rounded-lg ${orderCategory === "products" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
        Products
      </button>
    </div>

    {/* Filtered Orders List */}
    <ul>
      {orders[customer._id!]
        .filter((order) => 
          orderCategory === "all" ||
          (orderCategory === "classes" && order.product_items.includes("class")) ||
          (orderCategory === "products" && order.product_items.includes("product"))
        )
        .map((order) => (
          <li key={order._id} className="p-4 border-b border-gray-300">
            <p className="font-medium">Order ID: {order._id}</p>
            <p>Total: ${order.total_amount.toFixed(2)}</p>
            <p>Status: {order.order_status}</p>
            <p>Items: {order.product_items.join(", ")}</p>
          </li>
        ))}

      {/* Display message when no orders exist for the selected category */}
      {orders[customer._id!].filter((order) =>
        orderCategory === "all" ||
        (orderCategory === "classes" && order.product_items.includes("class")) ||
        (orderCategory === "products" && order.product_items.includes("product"))
      ).length === 0 && (
        <p className="text-gray-500 italic">No orders found for this category.</p>
      )}
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
}

export default CustomerManagementSection;