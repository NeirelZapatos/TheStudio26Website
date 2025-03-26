import { useState, useEffect } from "react";
import { fetchOrders } from "@/utils/fetchUtils/fetchOrders";
import { fetchCustomers } from "@/utils/fetchUtils/fetchCustomers";

/**
 * useFetchCustomers Hook:
 * Fetches and manages customer and order data based on search queries, date ranges, and time intervals.
 * 
 * Props:
 * - searchQuery: A string used to filter customers by name or email.
 * - dateRange: An object containing start and end dates for filtering orders.
 * - timeInterval: A string representing the time interval for filtering (e.g., "Daily", "Monthly").
 */
interface UseFetchCustomersProps {
  searchQuery: string; // Search query for filtering customers
  dateRange: { start: string; end: string }; // Date range for filtering orders
  timeInterval: string; // Time interval for filtering orders
}

/**
 * useFetchCustomers Hook:
 * Manages the state for customers, orders, and loading status.
 * Provides functionality to fetch and filter customers and orders.
 */
const useFetchCustomers = ({ searchQuery, dateRange, timeInterval }: UseFetchCustomersProps) => {
  const [customers, setCustomers] = useState<any[]>([]); // State for customers
  const [allOrders, setAllOrders] = useState<any[]>([]); // State for all orders
  const [orders, setOrders] = useState<{ [key: string]: any[] }>({}); // State for orders grouped by customer ID
  const [loading, setLoading] = useState(false); // State for loading state

  /**
   * Helper function to normalize dates to UTC format.
   * @param dateString - The date string to normalize.
   * @returns The normalized date string in UTC format.
   */
  const getUTCDate = (dateString: string): string => new Date(dateString).toISOString().split("T")[0];

  // Fetch all orders when the component mounts
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const ordersData = await fetchOrders("/api/orders"); // Fetch orders from the API
        console.log("Fetched Orders:", ordersData); // Log fetched orders
        setAllOrders(ordersData); // Update the allOrders state
      } catch (error) {
        console.error("Failed to fetch orders:", error); // Log errors
      }
    };
    fetchAllOrders(); // Invoke the fetch function
  }, []);

  /**
   * Fetches customers and filters orders based on search queries and date ranges.
   */
  const handleFetchCustomers = async () => {
    setLoading(true); // Set loading state to true
    try {
      // Fetch all customers
      const customersData = await fetchCustomers();

      // First, apply search query filter
      const searchFilteredCustomers = searchQuery
        ? customersData.filter(
            ({ email, first_name, last_name }: any) =>
              email.includes(searchQuery) ||
              `${first_name} ${last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : customersData;

      // Normalize and prepare orders for filtering
      const processedOrders = allOrders.map((order: any) => ({
        ...order,
        order_date: getUTCDate(order.order_date.toString())
      }));

      // If date range is specified, filter customers based on their order dates
      const dateFilteredCustomers = dateRange.start && dateRange.end
        ? searchFilteredCustomers.filter((customer: any) => {
            // Find orders for this customer within the date range
            const customerOrders = processedOrders.filter(
              (order: any) => 
                order.customer_id?.toString() === customer._id?.toString() &&
                order.order_date >= getUTCDate(dateRange.start) &&
                order.order_date <= getUTCDate(dateRange.end)
            );
            
            // Keep the customer only if they have orders in the date range
            return customerOrders.length > 0;
          })
        : searchFilteredCustomers;

      // Group orders by customer ID, preserving existing order visibility
      const ordersByCustomer = processedOrders.reduce<{ [key: string]: any[] }>((acc, order) => {
        const customerId = order.customer_id?.toString();
        const isWithinDateRange = 
          (!dateRange.start || !dateRange.end) || 
          (order.order_date >= getUTCDate(dateRange.start) && 
           order.order_date <= getUTCDate(dateRange.end));

        if (customerId && isWithinDateRange) {
          // Preserve existing orders if they were previously visible
          if (acc[customerId]) {
            acc[customerId].push(order);
          } else if (orders[customerId]) {
            // If orders were previously visible, keep them
            acc[customerId] = [order];
          }
        }
        return acc;
      }, {});

      // Update state with filtered customers and orders
      setCustomers(dateFilteredCustomers);
      setOrders(ordersByCustomer);
    } catch (error) {
      console.error("Failed to fetch customers:", error); // Log errors
      setCustomers([]); // Reset customers state
      setOrders({}); // Reset orders state
    } finally {
      setLoading(false); // Set loading state to false
    }
  };

  return { 
    customers, // List of filtered customers
    orders, // Orders grouped by customer ID
    allOrders, // All orders fetched from the API
    loading, // Loading state
    fetchCustomers: handleFetchCustomers, // Function to fetch and filter customers
    setCustomers, // Function to update customers state
    setOrders, // Function to update orders state
  };
};

export default useFetchCustomers;