import React, { useEffect } from 'react';
import { IOrder } from '@/app/models/Order';
import { searchOrders } from '@/utils/searchUtils'; // Import the search function


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
  orders: IOrder[];
  onSearchResults: (filteredOrders: IOrder[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({ orders, onSearchResults, searchQuery, setSearchQuery }: SearchBarProps) => {
  // Process search whenever query or orders change
  useEffect(() => {
    const normalizedQuery = searchQuery.trim();
    const filtered = searchOrders(orders, normalizedQuery); // Use the searchOrders function
    onSearchResults(filtered);
  }, [searchQuery, orders, onSearchResults]);

  // Handle input changes with better space handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedQuery = e.target.value.replace(/\s+/g, ' '); // Replace multiple spaces with a single space
    setSearchQuery(sanitizedQuery);
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
      <input
        type="text"
        placeholder="Search by customer name, order ID, or date..."
        className="w-full pl-10 pr-4 py-2 border rounded-lg"
        value={searchQuery}
        onChange={handleInputChange}
        autoComplete="off"
      />
    </div>
  );
};

export default SearchBar;