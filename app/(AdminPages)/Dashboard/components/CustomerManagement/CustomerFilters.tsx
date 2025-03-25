import React, { useState } from "react"; // Import React and useState hook

/**
 * CustomerFilters Component:
 * Provides a user interface for filtering customers based on search queries, date ranges, and time intervals.
 * 
 * Props:
 * - searchQuery: The current search query string used to filter customers by name or email.
 * - setSearchQuery: A function to update the search query state.
 * - dateRange: An object containing the start and end dates for filtering customers by date range.
 * - setDateRange: A function to update the date range state.
 * - timeInterval: The current time interval filter (e.g., "Daily", "Monthly").
 * - setTimeInterval: A function to update the time interval state.
 * - fetchCustomers: A function to fetch customers based on the applied filters.
 * - handleClearSearch: A function to clear all filters and reset the search state.
 */

interface CustomerFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="w-full">
      <label className="block text-gray-700 text-sm mb-2">
        Search Customers
      </label>
      <input
        type="text"
        placeholder="Search by name, email, or ID"
        className="w-full p-2 border border-gray-300 rounded-lg"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default CustomerFilters;