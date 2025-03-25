import { useState, useEffect } from "react";
import { fetchOrders } from "@/utils/fetchUtils/fetchOrders";
import { fetchCustomers } from "@/utils/fetchUtils/fetchCustomers";
import { calculateSimilarity, tokenize, levenshteinDistance } from "@/utils/searchUtils";

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
  searchQuery: string;
  dateRange: { start: string; end: string };
  timeInterval: string;
}

const useFetchCustomers = ({ searchQuery, dateRange, timeInterval }: UseFetchCustomersProps) => {
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [orders, setOrders] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(false);

  const getCustomerMatchScore = (customer: any, query: string): number => {
    if (!query) return 0;

    const queryLower = query.toLowerCase().trim();
    const queryTokens = tokenize(query);
    
    // Exact ID match
    const customerId = customer._id?.toString().toLowerCase();
    if (customerId === queryLower) return 10;
    if (customerId?.includes(queryLower)) return 9;

    // Email exact match
    const customerEmail = customer.email?.toLowerCase().trim();
    if (customerEmail === queryLower) return 8;
    if (customerEmail?.includes(queryLower)) return 7;

    // Customer name matching
    const customerName = `${customer.first_name || ''} ${customer.last_name || ''}`.toLowerCase().trim();
    const customerTokens = tokenize(customerName);

    // Check for first character or close match at the start
    const firstCharMatches = customerTokens.some(token => 
      token.startsWith(queryLower) || 
      calculateSimilarity(token.slice(0, queryLower.length), queryLower) > 0.8
    );

    if (firstCharMatches) return 6;

    // Fuzzy matching for full name
    let totalScore = 0;
    for (const queryToken of queryTokens) {
      let bestTokenMatch = 0;
      
      // Check exact inclusion first
      if (customerName.includes(queryToken)) {
        bestTokenMatch = 1.0;
      } else {
        // Check token similarities
        for (const fieldToken of customerTokens) {
          const similarity = calculateSimilarity(queryToken, fieldToken);
          bestTokenMatch = Math.max(bestTokenMatch, similarity);
        }
      }
      
      totalScore += bestTokenMatch;
    }

    // Normalize the score
    const normalizedScore = (totalScore / queryTokens.length) * 5;
    
    return normalizedScore;
  };

  const getUTCDate = (dateString: string): string => new Date(dateString).toISOString().split("T")[0];

  // Fetch all data on initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [customersData, ordersData] = await Promise.all([
          fetchCustomers(),
          fetchOrders("/api/orders")
        ]);
        
        setAllCustomers(customersData);
        setFilteredCustomers(customersData);
        setAllOrders(ordersData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Apply filters whenever searchQuery or dateRange changes
  useEffect(() => {
    if (!allCustomers.length) return;

    // Apply search filter
    let filtered = allCustomers;
    if (searchQuery) {
      filtered = allCustomers
        .map(customer => ({
          customer,
          score: getCustomerMatchScore(customer, searchQuery)
        }))
        .filter(item => item.score > 2)
        .sort((a, b) => b.score - a.score)
        .map(item => item.customer);
    }

    setFilteredCustomers(filtered);

    // Apply date filter to orders
    const customerIds = new Set(filtered.map(({ _id }: any) => _id?.toString()));
    let filteredOrders = allOrders
      .map((order: any) => ({ ...order, order_date: getUTCDate(order.order_date.toString()) }))
      .filter((order: any) => customerIds.has(order.customer_id?.toString()));

    if (dateRange.start && dateRange.end) {
      const startDateStr = getUTCDate(dateRange.start);
      const endDateStr = getUTCDate(dateRange.end);
      filteredOrders = filteredOrders.filter(
        ({ order_date }: any) => order_date >= startDateStr && order_date <= endDateStr
      );
    }

    const ordersByCustomer = filteredOrders.reduce<{ [key: string]: any[] }>((acc, order) => {
      const customerId = order.customer_id?.toString();
      if (customerId) {
        (acc[customerId] ||= []).push(order);
      }
      return acc;
    }, {});

    setOrders(ordersByCustomer);
  }, [searchQuery, dateRange, allCustomers, allOrders]);

  return { 
    customers: filteredCustomers,
    orders,
    allOrders,
    loading,
    setCustomers: setAllCustomers,
    setOrders,
  };
};

export default useFetchCustomers;