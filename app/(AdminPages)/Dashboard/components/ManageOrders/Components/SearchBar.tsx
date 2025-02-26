import React, { useEffect } from 'react'; // Import React and useEffect
import { IOrder } from '@/app/models/Order'; // Import IOrder interface

/**
 * SearchBar Component:
 * Provides a search input field to filter orders by customer name, order ID, or date.
 * 
 * Props:
 * - orders: Array of orders to search through.
 * - onSearchResults: Function to set the filtered results.
 * - searchQuery: Current search query.
 * - setSearchQuery: Function to update the search query.
 */

interface SearchBarProps {
  orders: IOrder[]; // Orders data
  onSearchResults: (filteredOrders: IOrder[]) => void; // Function to set search results
  searchQuery: string; // Current search query
  setSearchQuery: (query: string) => void; // Function to set search query
}

const SearchBar = ({ orders, onSearchResults, searchQuery, setSearchQuery }: SearchBarProps) => {
  useEffect(() => {
    const searchOrders = () => {
      const query = searchQuery.toLowerCase(); // Convert query to lowercase for case-insensitive search
      const filtered = orders.filter((order) => {
        const customerName = `${order.customer?.first_name} ${order.customer?.last_name}`.toLowerCase(); // Get customer name
        const orderId = order._id.toString().toLowerCase(); // Get order ID
        const orderDate = new Date(order.order_date).toLocaleDateString().toLowerCase(); // Get order date

        // Search across multiple fields, starting from the beginning of the string
        return (
          customerName.startsWith(query) || // Match customer name from the beginning
          orderId.startsWith(query) || // Match order ID from the beginning
          orderDate.startsWith(query) // Match order date from the beginning
        );
      });

      onSearchResults(filtered); // Set search results
    };

    searchOrders(); // Call search function
  }, [searchQuery, orders, onSearchResults]); // Re-run effect when searchQuery or orders change

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span> {/* Search icon */}
      <input
        type="text"
        placeholder="Search by customer name, order ID, or date..." // Placeholder text
        className="w-full pl-10 pr-4 py-2 border rounded-lg" // Input styling
        value={searchQuery} // Current search query
        onChange={(e) => setSearchQuery(e.target.value)} // Handle input change (no modifications here)
      />
    </div>
  );
};

export default SearchBar;