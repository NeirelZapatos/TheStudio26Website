import React, { useEffect } from 'react';
import { IOrder } from '@/app/models/Order';
import { searchOrders } from '@/utils/searchUtils/searchOrders';

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
    const filtered = searchOrders(orders, normalizedQuery);
    onSearchResults(filtered);
  }, [searchQuery, orders, onSearchResults]);

  // Handle input changes with better space handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedQuery = e.target.value.replace(/\s+/g, ' ');
    setSearchQuery(sanitizedQuery);
  };

  return (
    <div className="relative mb-4">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search by customer name, order ID, or date..."
        className="w-full pl-10 pr-4 py-2 border border-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        value={searchQuery}
        onChange={handleInputChange}
        autoComplete="off"
      />
    </div>
  );
};

export default SearchBar;