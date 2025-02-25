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
  searchQuery: string; // Current search query for filtering customers by name or email
  setSearchQuery: (query: string) => void; // Function to update the search query
  dateRange: { start: string; end: string }; // Current date range for filtering customers
  setDateRange: (range: { start: string; end: string }) => void; // Function to update the date range
  timeInterval: string; // Current time interval for filtering customers
  setTimeInterval: (interval: string) => void; // Function to update the time interval
  fetchCustomers: () => void; // Function to fetch customers based on the applied filters
  handleClearSearch: () => void; // Function to clear all filters and reset the search state
}

/**
 * CustomerFilters Functional Component:
 * Renders a form with input fields for filtering customers and buttons to apply or clear filters.
 */
const CustomerFilters: React.FC<CustomerFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  timeInterval,
  setTimeInterval,
  fetchCustomers,
  handleClearSearch,
}) => {
  return (
    <div>
      {/* Grid layout for search and date range inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Search by Name or Email */}
        <div>
          {/* Label for the search input */}
          <label className="block text-gray-700 text-sm mb-2">
            Search by Name or Email
          </label>
          {/* Input field for searching customers by name or email */}
          <input
            type="text" // Text input type
            placeholder="Enter name or email" // Placeholder text
            className="w-full p-2 border border-gray-300 rounded-lg" // Styling for the input field
            value={searchQuery} // Bind the input value to the searchQuery state
            onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state on input change
          />
        </div>

        {/* Date Range Filter */}
        <div>
          {/* Label for the date range inputs */}
          <label className="block text-gray-700 text-sm mb-2">
            Date Range
          </label>
          {/* Container for the start and end date inputs */}
          <div className="space-y-2">
            {/* Start Date Input */}
            <input
              type="date" // Date input type
              placeholder="mm/dd/yyyy" // Placeholder text
              className="w-full p-2 border border-gray-300 rounded-lg" // Styling for the input field
              value={dateRange.start} // Bind the input value to the start date state
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value }) // Update start date state on input change
              }
            />
            {/* End Date Input */}
            <input
              type="date" // Date input type
              placeholder="mm/dd/yyyy" // Placeholder text
              className="w-full p-2 border border-gray-300 rounded-lg" // Styling for the input field
              value={dateRange.end} // Bind the input value to the end date state
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value }) // Update end date state on input change
              }
            />
          </div>
        </div>
      </div>

      {/* Apply and Clear Filters Buttons */}
      <div className="flex items-center space-x-2">
        {/* Apply Filters Button */}
        <button
          onClick={fetchCustomers} // Trigger fetchCustomers function on click
          className="bg-blue-500 text-white py-2 px-4 rounded-lg" // Styling for the button
        >
          Apply Filters
        </button>

        {/* Clear Search Button */}
        <button
          onClick={handleClearSearch} // Trigger handleClearSearch function on click
          className="bg-gray-500 text-white py-2 px-4 rounded-lg" // Styling for the button
        >
          Clear Search
        </button>
      </div>
    </div>
  );
};

export default CustomerFilters; // Export the CustomerFilters component