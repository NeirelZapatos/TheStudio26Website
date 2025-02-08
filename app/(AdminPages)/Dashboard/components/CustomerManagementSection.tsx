import React, { useState } from "react";

interface Customer {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
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
  // State declarations
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<{ [key: string]: Order[] }>({});
  const [newCustomer, setNewCustomer] = useState<Customer>({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [timeInterval, setTimeInterval] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderCategory, setOrderCategory] = useState<"all" | "classes" | "products">("all");

  // Helper function to normalize dates to UTC
const getUTCDate = (dateString: string): string => new Date(dateString).toISOString().split("T")[0];

const fetchCustomers = async () => {
  setLoading(true);
  try {
    // Construct API query
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append("search", searchQuery);
    if (timeInterval) queryParams.append("interval", timeInterval);

    // Step 1: Fetch Customers
    const customerResponse = await fetch(`/api/customers?${queryParams}`);
    if (!customerResponse.ok) throw new Error("Failed to fetch customers.");

    let customersData: Customer[] = await customerResponse.json();

    // Normalize phone_number
    customersData = customersData.map((customer) => ({
      ...customer,
      phone_number: customer.phone_number || "",
    }));

    // Step 2: Apply local filtering based on email/name (only if searchQuery exists)
    const filteredCustomers = searchQuery
      ? customersData.filter(
          ({ email, first_name, last_name }) =>
            email.includes(searchQuery) ||
            `${first_name} ${last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : customersData;

    if (!filteredCustomers.length) {
      setCustomers([]);
      setOrders({});
      return;
    }

    // Step 3: Fetch Orders
    const orderResponse = await fetch(`/api/orders`);
    if (!orderResponse.ok) throw new Error("Failed to fetch orders.");
    let ordersData: Order[] = await orderResponse.json();

    console.log("Raw Orders Data:", ordersData);

    // Normalize order_date & filter orders for relevant customers
    const customerIds = new Set(filteredCustomers.map(({ _id }) => _id));
    let filteredOrders = ordersData
      .map((order) => ({ ...order, order_date: getUTCDate(order.order_date) }))
      .filter((order) => customerIds.has(order.customer_id));

    console.log("Matched Orders Before Date Filter:", filteredOrders);

    // Step 4: Apply Date Filtering (if provided)
    if (dateRange.start && dateRange.end) {
      const startDateStr = getUTCDate(dateRange.start);
      const endDateStr = getUTCDate(dateRange.end);
      filteredOrders = filteredOrders.filter(
        ({ order_date }) => order_date >= startDateStr && order_date <= endDateStr
      );

      console.log("Final Orders After Date Filtering:", filteredOrders);
    }

    // Step 5: Organize Orders by Customer ID
    const ordersByCustomer = filteredOrders.reduce<{ [key: string]: Order[] }>((acc, order) => {
      (acc[order.customer_id] ||= []).push(order);
      return acc;
    }, {});

    console.log("Orders Organized by Customer ID:", ordersByCustomer);

    // Step 6: Update State
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
    // Fetch all orders
    const response = await fetch(`/api/orders`);
    if (!response.ok) throw new Error("Failed to fetch orders.");
    let ordersData: Order[] = await response.json();

    // Normalize order_date & filter orders for the specific customer
    const startDateStr = dateRange.start ? getUTCDate(dateRange.start) : null;
    const endDateStr = dateRange.end ? getUTCDate(dateRange.end) : null;

    const filteredOrders = ordersData
      .map((order) => ({ ...order, order_date: getUTCDate(order.order_date) }))
      .filter(({ customer_id, order_date }) => {
        if (customer_id !== customerId) return false;
        return startDateStr && endDateStr ? order_date >= startDateStr && order_date <= endDateStr : true;
      });

    // Update state with filtered orders
    setOrders((prev) => ({ ...prev, [customerId]: filteredOrders }));
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }
};
  
  // Helper function to reset new customer form
const resetNewCustomerForm = () => setNewCustomer({ first_name: "", last_name: "", email: "", phone_number: "" });

const handleFilterApply = fetchCustomers;

const handleClearSearch = () => {
  setSearchQuery("");
  setDateRange({ start: "", end: "" });
  setTimeInterval("");
  setCustomers([]);
};

const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setNewCustomer((prev) => ({
    ...prev,
    [name]: name === "phone_number" ? value.replace(/\D/g, "") : value, // Remove non-numeric characters
  }));
};

const addCustomer = async () => {
  try {
    const customerData = {
      ...newCustomer,
      phone_number: newCustomer.phone_number ? Number(newCustomer.phone_number) : undefined,
    };

    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.errors ? errorData.errors.map((e: any) => e.message).join(", ") : errorData.error || "Unknown error"
      );
    }

    const addedCustomer = await response.json();
    setCustomers((prev) => [...prev, addedCustomer]);
    resetNewCustomerForm();
    alert("Customer added successfully!");
  } catch (error) {
    const errMessage = (error as Error).message || "An unexpected error occurred.";
    console.error("Error adding customer:", errMessage);
    alert(`Failed to add customer: ${errMessage}`);
  }
};

const deleteCustomer = async (id: string) => {
  if (!window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;

  try {
    const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });

    if (!response.ok) throw new Error("Failed to delete customer.");

    setCustomers((prev) => prev.filter((customer) => customer._id !== id));
    alert("Customer deleted successfully!");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error adding customer:", error.message);
      alert(`Failed to add customer: ${error.message}`);
    } else {
      console.error("Unknown error:", error);
      alert("An unexpected error occurred.");
    }
  }
};

const handleShowOrders = (customerId: string) => {
  setOrders((prev) => {
    const updatedOrders = { ...prev };
    if (updatedOrders[customerId]) {
      delete updatedOrders[customerId];
    } else {
      fetchOrders(customerId);
    }
    return updatedOrders;
  });
};

const handleCategoryChange = setOrderCategory;

const exportOrdersToCSV = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").replace("Z", "");
  const filename = `customer_orders_${timestamp}.csv`;
  let csvContent = "Order ID,Customer Name,Email,Phone Number,Order Date,Total Amount,Status,Items\n";

  customers.forEach((customer) => {
    (orders[customer._id!] || []).forEach((order) => {
      csvContent += `${order._id},"${customer.first_name} ${customer.last_name}","${customer.email}","${
        customer.phone_number || "N/A"
      }",${order.order_date},$${order.total_amount.toFixed(2)},${order.order_status},"${order.product_items.join(" | ")}"\n`;
    });
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csvContent], { type: "text/csv" }));
  link.download = filename;
  document.body.appendChild(link);
  link.click();
};

  const renderOrderItem = (order: Order) => {
    const classesPurchased = order.product_items.filter((item) =>
      item.includes("Class")
    );
    const productsPurchased = order.product_items.filter(
      (item) => !item.includes("Class")
    );
    
    // let productsPurchase []
    // for(let i = 0; i < productsPurchase.length; i++) {

    // }

    return (
      <li key={order._id} className="mb-4 border p-3 rounded-md bg-gray-100">
        <p>
          <strong>Order ID:</strong> {order._id}
        </p>
        <p>
          <strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}
        </p>
        <p>
          <strong>Status:</strong> {order.order_status}
        </p>
        <p>
          <strong>Total Amount:</strong> ${order.total_amount.toFixed(2)}
        </p>

        {orderCategory !== "products" && classesPurchased.length > 0 && (
          <div className="mt-2">
            <strong>Classes Purchased:</strong>
            <ul className="list-disc pl-4">
              {classesPurchased.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {orderCategory !== "classes" && productsPurchased.length > 0 && (
          <div className="mt-2">
            <strong>Products Purchased:</strong>
            <ul className="list-disc pl-4">
              {productsPurchased.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  // Filter and render orders for a given customer.
  const renderOrders = (customerId: string) => {
    const customerOrders = orders[customerId] || [];
    const filteredOrders = customerOrders.filter((order) => {
      const classesPurchased = order.product_items.filter((item) =>
        item.includes("Class")
      );
      const productsPurchased = order.product_items.filter(
        (item) => !item.includes("Class")
      );

      if (orderCategory === "classes") return classesPurchased.length > 0;
      if (orderCategory === "products") return productsPurchased.length > 0;
      return true; // For "all"
    });

    if (filteredOrders.length === 0) {
      return <p className="text-gray-500 italic">No orders found for this category.</p>;
    }

    return <ul className="list-disc pl-6">{filteredOrders.map(renderOrderItem)}</ul>;
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
            required
          />
          <input
            type="tel"
            name="phone_number"
            placeholder="Phone Number (Optional)"
            value={newCustomer.phone_number}
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
          <label className="block text-gray-700 font-medium mb-2">Date Range</label>
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
      {customers.length > 0 ? (
        <ul>
          {customers.map((customer) => (
            <li key={customer._id} className="p-4 border-b border-gray-300">
              <div className="flex justify-between items-center">
                <p className="font-medium">
                  {customer.first_name} {customer.last_name} - {customer.email}
                  {customer.phone_number !== undefined && ` - ${customer.phone_number}`} {/* Display phone number if available */}
                </p>
                <div className="space-x-2">
                  <button
                    onClick={() => handleShowOrders(customer._id!)}
                    className="mt-2 bg-blue-500 text-white py-1 px-3 rounded-lg"
                  >
                    {orders[customer._id!] ? "Hide Orders" : "Show Orders"}
                  </button>
                  <button
                    onClick={() => deleteCustomer(customer._id!)}
                    className="mt-2 bg-red-500 text-white py-1 px-3 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {orders[customer._id!] && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold mb-2">Orders:</h4>
                  {/* Order Category Filter Buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handleCategoryChange("all")}
                      className={`px-3 py-1 rounded-lg ${
                        orderCategory === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleCategoryChange("classes")}
                      className={`px-3 py-1 rounded-lg ${
                        orderCategory === "classes" ? "bg-blue-500 text-white" : "bg-gray-200"
                      }`}
                    >
                      Classes
                    </button>
                    <button
                      onClick={() => handleCategoryChange("products")}
                      className={`px-3 py-1 rounded-lg ${
                        orderCategory === "products" ? "bg-blue-500 text-white" : "bg-gray-200"
                      }`}
                    >
                      Products
                    </button>
                  </div>
                  {renderOrders(customer._id!)}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No customers found with the current filters.</p>
      )}
    </div>
    </section>
  );
};

export default CustomerManagementSection;