

import React, { useEffect, useState } from "react"; // Import React and useState hook

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
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  timeInterval: string;
  setTimeInterval: (interval: string) => void;
  fetchCustomers: () => void;
  handleClearSearch: () => void;
}

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
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce effect for dynamic search
  useEffect(() => {
    const timerId = setTimeout(() => {
      // Only update search query if it has changed
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery);
      }
    }, 300); // 300ms delay to prevent excessive re-renders

    return () => clearTimeout(timerId);
  }, [localSearchQuery, searchQuery, setSearchQuery]);

  /**
   * Validates and filters dates
   * @param start Start date string
   * @param end End date string
   * @returns Filtered date range
   */
  const filterDateRange = (start: string, end: string) => {
    // If no dates are provided, return empty range
    if (!start && !end) return { start: '', end: '' };

    // If only start date is provided, set end to today
    if (start && !end) {
      return { 
        start, 
        end: new Date().toISOString().split('T')[0] 
      };
    }

    // If only end date is provided, set start to a default (e.g., 1 year ago)
    if (!start && end) {
      const defaultStart = new Date();
      defaultStart.setFullYear(defaultStart.getFullYear() - 1);
      return { 
        start: defaultStart.toISOString().split('T')[0], 
        end 
      };
    }

    // If both dates are provided, ensure end is not before start
    if (start && end) {
      return start <= end 
        ? { start, end }
        : { start: end, end: start }; // Swap if start is after end
    }

    return { start: '', end: '' };
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Search by Name or Email */}
        <div>
          <label className="block text-gray-700 text-sm mb-2">
            Search by Name or Email
          </label>
          <input
            type="text"
            placeholder="Enter name or email"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-gray-700 text-sm mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            {/* Start Date Input */}
            <input
              type="date"
              placeholder="mm/dd/yyyy"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={dateRange.start}
              onChange={(e) => {
                const filteredRange = filterDateRange(e.target.value, dateRange.end);
                setDateRange(filteredRange);
              }}
            />
            {/* End Date Input */}
            <input
              type="date"
              placeholder="mm/dd/yyyy"
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={dateRange.end}
              onChange={(e) => {
                const filteredRange = filterDateRange(dateRange.start, e.target.value);
                setDateRange(filteredRange);
              }}
            />
          </div>
        </div>
      </div>

      {/* Apply and Clear Filters Buttons */}
      <div className="flex items-center space-x-2">
        {/* Apply Filters Button (Now only for date range) */}
        <button
          onClick={fetchCustomers}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          Apply Date Filters
        </button>

        {/* Clear Search Button */}
        <button
          onClick={handleClearSearch}
          className="bg-gray-500 text-white py-2 px-4 rounded-lg"
        >
          Clear Search
        </button>
      </div>
    </div>
  );
};

export default CustomerFilters;

//Working on this for the date filtering


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

/*
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
    //<div>
     // {/* Grid layout for search and date range inputs */
     // <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      //  {/* Search by Name or Email */}
      //  <div>
    //      {/* Label for the search input */}
       //   <label className="block text-gray-700 text-sm mb-2">
      //      Search by Name or Email
      //    </label>
        //  {/* Input field for searching customers by name or email */}
      //    <input
      //      type="text" // Text input type
       //     placeholder="Enter name or email" // Placeholder text
       //     className="w-full p-2 border border-gray-300 rounded-lg" // Styling for the input field
       //     value={searchQuery} // Bind the input value to the searchQuery state
       //     onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state on input change
       //   />
       // </div>

       // {/* Date Range Filter */}
       // <div>
       //   {/* Label for the date range inputs */}
       ////   <label className="block text-gray-700 text-sm mb-2">
      //      Date Range
       //   </label>
       //   {/* Container for the start and end date inputs */}
       //   <div className="space-y-2">
       //     {/* Start Date Input */}
       //     <input
        //      type="date" // Date input type
       //       placeholder="mm/dd/yyyy" // Placeholder text
         //     className="w-full p-2 border border-gray-300 rounded-lg" // Styling for the input field
          //    value={dateRange.start} // Bind the input value to the start date state
          //    onChange={(e) =>
          //      setDateRange({ ...dateRange, start: e.target.value }) // Update start date state on input change
           //   }
          //  />
           // {/* End Date Input */}
          //  <input
            //  type="date" // Date input type
           //   placeholder="mm/dd/yyyy" // Placeholder text
           //   className="w-full p-2 border border-gray-300 rounded-lg" // Styling for the input field
           //   value={dateRange.end} // Bind the input value to the end date state
           //   onChange={(e) =>
           //     setDateRange({ ...dateRange, end: e.target.value }) // Update end date state on input change
           //   }
          //  />
       //   </div>
       // </div>
   //   </div>

      //{/* Apply and Clear Filters Buttons */}
     // <div className="flex items-center space-x-2">
      //  {/* Apply Filters Button */}
      //  <button
      //    onClick={fetchCustomers} // Trigger fetchCustomers function on click
    //      className="bg-blue-500 text-white py-2 px-4 rounded-lg" // Styling for the button
     //   >
       //   Apply Filters
       // </button>

      //  {/* Clear Search Button */}
       // <button
      //    onClick={handleClearSearch} // Trigger handleClearSearch function on click
      //    className="bg-gray-500 text-white py-2 px-4 rounded-lg" // Styling for the button
    //    >
    //      Clear Search
   //     </button>
   //   </div>
 //   </div>
 // );
//};

//export default CustomerFilters; // Export the CustomerFilters component

