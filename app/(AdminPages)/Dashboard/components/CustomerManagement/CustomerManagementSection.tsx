import React, { useState, useMemo, useEffect } from "react"; // Import React and hooks
import AddCustomerForm from './AddCustomerForm'; // Import AddCustomerForm component
import CustomerFilters from "./CustomerFilters"; // Import CustomerFilters component
import CustomerList from "./CustomerList"; // Import CustomerList component
import ExportButton from "./ExportButton"; // Import ExportButton component
import useFetchCustomers from "./hooks/useFetchCustomers"; // Import custom hook for fetching customers
import useCustomerActions from "./hooks/useCustomerActions"; // Import custom hook for customer actions
import sortCustomers from "@/utils/sortCustomers"; // Import utility function for sorting customers

/**
 * CustomerManagementSection Component:
 * Manages the display and interaction for customer management, including adding, filtering,
 * and exporting customer data. Uses custom hooks (`useFetchCustomers` and `useCustomerActions`)
 * to handle data fetching and actions like adding or deleting customers.
 *
 * Custom Hook Design Pattern:
 * The custom hook design pattern is used here to encapsulate reusable logic for fetching customer
 * data and managing customer-related actions. This pattern separates concerns by moving logic
 * out of the component and into reusable hooks, making the code more modular and easier to maintain.
 *
 * - `useFetchCustomers`: Handles fetching and filtering customer and order data based on search
 *   queries, date ranges, and time intervals. It manages the state for customers, orders, and
 *   loading status.
 * - `useCustomerActions`: Manages customer-related actions such as adding, deleting, and toggling
 *   the visibility of orders. It encapsulates logic for interacting with the API and updating
 *   the state.
 *
 * Benefits of Using Custom Hooks:
 * 1. **Reusability**: The same logic can be reused across multiple components.
 * 2. **Separation of Concerns**: Logic is separated from the UI, making components cleaner and
 *    easier to understand.
 * 3. **Testability**: Custom hooks can be tested independently of the components that use them.
 * 4. **Simplicity**: Reduces the complexity of components by abstracting away logic.
 *
 * How We Use It:
 * - The `useFetchCustomers` hook fetches and filters customer and order data, which is then
 *   displayed in the `CustomerList` component.
 * - The `useCustomerActions` hook handles adding and deleting customers, as well as toggling
 *   the visibility of their orders. These actions are triggered by user interactions in the
 *   `AddCustomerForm` and `CustomerList` components.
 */

const CustomerManagementSection: React.FC = () => {
  // State for search query, date range, time interval, and order category
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering customers
  const [dateRange, setDateRange] = useState({ start: "", end: "" }); // Date range for filtering
  const [timeInterval, setTimeInterval] = useState(""); // Time interval for filtering
  const [orderCategory, setOrderCategory] = useState<"all" | "classes" | "products">("all"); // Order category filter

  // Fetch customers and orders using the `useFetchCustomers` hook
  const { customers, orders, allOrders, loading, fetchCustomers, setCustomers, setOrders } = useFetchCustomers({
    searchQuery,
    dateRange,
    timeInterval,
  });

  // Handle customer actions using the `useCustomerActions` hook
  const { addCustomer, deleteCustomer, handleShowOrders, loading: addCustomerLoading } = useCustomerActions({
    setCustomers,
    setOrders,
    dateRange,
    allOrders, // Pass preloaded orders
  });

  // Clear search and reset filters
  const handleClearSearch = () => {
    setSearchQuery("");
    setDateRange({ start: "", end: "" });
    setTimeInterval("");
    setCustomers([]);
  };

  // Sort customers alphabetically using the utility function
  const sortedCustomers = useMemo(() => sortCustomers(customers), [customers]);

  // Fetch customers and orders when the component mounts
  useEffect(() => {
    fetchCustomers();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <section className="bg-white shadow rounded-lg p-2">
      <h2 className="text-xl font-semibold mb-4">Customer Management</h2>

      {/* Add Customer Form */}
      <AddCustomerForm addCustomer={addCustomer} loading={addCustomerLoading} />

      {/* Filter and Export Buttons */}
      <div className="flex items-center gap-4 mt-4">
        <CustomerFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dateRange={dateRange}
          setDateRange={setDateRange}
          timeInterval={timeInterval}
          setTimeInterval={setTimeInterval}
          fetchCustomers={fetchCustomers}
          handleClearSearch={handleClearSearch}
        />
        <ExportButton customers={customers} orders={orders} />
      </div>

      {/* Customer List */}
      <CustomerList
        customers={sortedCustomers} // Pass the sorted customers array
        orders={orders}
        orderCategory={orderCategory}
        setOrderCategory={setOrderCategory}
        handleShowOrders={handleShowOrders}
        deleteCustomer={deleteCustomer}
      />
    </section>
  );
};

export default CustomerManagementSection;
