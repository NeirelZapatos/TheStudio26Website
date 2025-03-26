

import React, { useEffect, useState } from "react"; // Import React and useState hook
import ExportButton from "./ExportButton";

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
  customers: any[];
  orders: { [key: string]: any[] };
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
  customers,
  orders,
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce effect for dynamic search
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (localSearchQuery !== searchQuery) {
        setSearchQuery(localSearchQuery);
      }
    }, 300);

    return () => clearTimeout(timerId);
  }, [localSearchQuery, searchQuery, setSearchQuery]);

  /**
   * Validates and filters dates
   * @param start Start date string
   * @param end End date string
   * @returns Filtered date range
   */
  const filterDateRange = (start: string, end: string) => {
    if (!start && !end) return { start: '', end: '' };

    if (start && !end) {
      return { 
        start, 
        end: new Date().toISOString().split('T')[0] 
      };
    }

    if (!start && end) {
      const defaultStart = new Date();
      defaultStart.setFullYear(defaultStart.getFullYear() - 1);
      return { 
        start: defaultStart.toISOString().split('T')[0], 
        end 
      };
    }

    if (start && end) {
      return start <= end 
        ? { start, end }
        : { start: end, end: start };
    }

    return { start: '', end: '' };
  };

  // Time interval options
  const timeIntervalOptions = [
    { value: '', label: 'All Time' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'thisYear', label: 'This Year' }
  ];

  // Handle time interval change
  const handleTimeIntervalChange = (interval: string) => {
    setTimeInterval(interval);

    const now = new Date();
    let start = '';
    let end = now.toISOString().split('T')[0];

    switch(interval) {
      case 'last7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'last30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'last90days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'thisYear':
        start = `${now.getFullYear()}-01-01`;
        break;
      default:
        start = '';
        end = '';
    }

    setDateRange({ start, end });
  };

  return (
    <div className="space-y-4">
      {/* Date Range and Time Interval Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Start Date Input */}
        <div>
          <label className="block text-gray-700 text-sm mb-2">
            Start Date
          </label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={dateRange.start}
            onChange={(e) => {
              const filteredRange = filterDateRange(e.target.value, dateRange.end);
              setDateRange(filteredRange);
              setTimeInterval('');
            }}
          />
        </div>

        {/* End Date Input */}
        <div>
          <label className="block text-gray-700 text-sm mb-2">
            End Date
          </label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={dateRange.end}
            onChange={(e) => {
              const filteredRange = filterDateRange(dateRange.start, e.target.value);
              setDateRange(filteredRange);
              setTimeInterval('');
            }}
          />
        </div>

        {/* Time Interval Dropdown */}
        <div>
          <label className="block text-gray-700 text-sm mb-2">
            Time Interval
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={timeInterval}
            onChange={(e) => handleTimeIntervalChange(e.target.value)}
          >
            {timeIntervalOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex justify-between items-center mt-4">
        {/* Left-side Filter Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchCustomers}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearSearch}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Search
          </button>
        </div>

        {/* Export Orders Button */}
        <ExportButton 
          customers={customers} 
          orders={orders} 
        />
      </div>

      {/* Search Bar Row */}
      <div className="mt-4">
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
    </div>
  );
};

export default CustomerFilters;