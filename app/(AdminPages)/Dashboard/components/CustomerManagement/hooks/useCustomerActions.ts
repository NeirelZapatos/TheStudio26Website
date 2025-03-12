import { useState } from "react";

/**
 * useCustomerActions Hook:
 * Provides functionality to add, delete, and manage customer orders.
 * 
 * Props:
 * - setCustomers: A function to update the customers state.
 * - setOrders: A function to update the orders state.
 * - dateRange: An object containing start and end dates for filtering orders.
 * - allOrders: An array of all preloaded orders.
 */
interface UseCustomerActionsProps {
  setCustomers: (customers: any[] | ((prev: any[]) => any[])) => void; // Function to update customers state
  setOrders: (orders: { [key: string]: any[] } | ((prev: { [key: string]: any[] }) => { [key: string]: any[] })) => void; // Function to update orders state
  dateRange: { start: string; end: string }; // Date range for filtering orders
  allOrders: any[]; // Preloaded orders from useFetchCustomers
}

/**
 * useCustomerActions Hook:
 * Manages customer-related actions such as adding, deleting, and toggling order visibility.
 */
const useCustomerActions = ({ setCustomers, setOrders, dateRange, allOrders }: UseCustomerActionsProps) => {
  const [loading, setLoading] = useState(false); // State for loading status

  /**
   * Helper function to normalize dates to UTC format.
   * @param dateString - The date string to normalize.
   * @returns The normalized date string in UTC format.
   */
  const getUTCDate = (dateString: string): string => new Date(dateString).toISOString().split("T")[0];

  /**
   * Adds a new customer to the database and updates the state.
   * @param customerData - The data of the customer to add.
   */
  const addCustomer = async (customerData: any) => {
    setLoading(true); // Set loading state to true
    try {
      const payload = {
        ...customerData,
        customer_id: customerData.customer_id ? Number(customerData.customer_id) : undefined,
        phone_number: customerData.phone_number ? Number(customerData.phone_number) : undefined,
      };

      // Send a POST request to add the customer
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Handle errors
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors ? errorData.errors.map((e: any) => e.message).join(", ") : errorData.error || "Unknown error"
        );
      }

      // Update state with the added customer
      const addedCustomer = await response.json();
      const normalizedCustomer = {
        ...addedCustomer,
        _id: addedCustomer._id?.toString(),
        phone_number: addedCustomer.phone_number || "",
      };

      setCustomers((prev: any[]) => [...prev, normalizedCustomer]);
      alert("Customer added successfully!"); // Notify user
    } catch (error) {
      const errMessage = (error as Error).message || "An unexpected error occurred.";
      console.error("Error adding customer:", errMessage); // Log errors
      alert(`Failed to add customer: ${errMessage}`); // Notify user
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  /**
   * Deletes a customer from the database and updates the state.
   * @param id - The ID of the customer to delete.
   */
  const deleteCustomer = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;

    try {
      // Send a DELETE request to remove the customer
      const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });

      // Handle errors
      if (!response.ok) throw new Error("Failed to delete customer.");

      // Update state to remove the deleted customer
      setCustomers((prev: any[]) => prev.filter((customer: any) => customer._id?.toString() !== id.toString()));
      setOrders((prev: { [key: string]: any[] }) => {
        const updatedOrders = { ...prev };
        delete updatedOrders[id];
        return updatedOrders;
      });

      alert("Customer deleted successfully!"); // Notify user
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error deleting customer:", error.message); // Log errors
        alert(`Failed to delete customer: ${error.message}`); // Notify user
      } else {
        console.error("Unknown error:", error); // Log unknown errors
        alert("An unexpected error occurred."); // Notify user
      }
    }
  };

  /**
   * Toggles the visibility of orders for a specific customer.
   * @param customerId - The ID of the customer whose orders are to be shown or hidden.
   */
  const handleShowOrders = (customerId: string) => {
    setOrders((prev: { [key: string]: any[] }) => {
      const updatedOrders = { ...prev };
      if (updatedOrders[customerId]) {
        // Hide orders if they are already visible
        delete updatedOrders[customerId];
      } else {
        // Filter preloaded orders for the customer based on date range
        const startDateStr = dateRange.start ? getUTCDate(dateRange.start) : null;
        const endDateStr = dateRange.end ? getUTCDate(dateRange.end) : null;

        const filteredOrders = allOrders
          .map((order: any) => ({ ...order, order_date: getUTCDate(order.order_date.toString()) }))
          .filter(({ customer_id, order_date }: any) => {
            if (customer_id?.toString() !== customerId) return false;
            return startDateStr && endDateStr ? order_date >= startDateStr && order_date <= endDateStr : true;
          });

        console.log("Filtered Orders for Customer:", customerId, filteredOrders); // Log filtered orders
        updatedOrders[customerId] = filteredOrders; // Show orders for the customer
      }
      return updatedOrders;
    });
  };

  return { addCustomer, deleteCustomer, handleShowOrders, loading };
};

export default useCustomerActions;