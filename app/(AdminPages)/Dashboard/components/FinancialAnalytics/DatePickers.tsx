import React from 'react'; // Import React

/**
 * DatePickers Component:
 * Allows users to select a start and end date for filtering financial data.
 * Props:
 * - startDate: The selected start date.
 * - endDate: The selected end date.
 * - onStartDateChange: Function to update the start date.
 * - onEndDateChange: Function to update the end date.
 * - onFilterClick: Function to trigger filtering based on the selected date range.
 */
interface DatePickersProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFilterClick: () => void;
}

const DatePickers: React.FC<DatePickersProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFilterClick
}) => {
  return (
    <div className="flex items-center gap-4">
      {/* Start Date Input */}
      <div>
        <label htmlFor="start-date" className="block text-gray-600 mb-1">
          Start Date:
        </label>
        <input
          type="date"
          id="start-date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="bg-gray-200 text-gray-900 p-2 rounded-lg"
        />
      </div>

      {/* End Date Input */}
      <div>
        <label htmlFor="end-date" className="block text-gray-600 mb-1">
          End Date:
        </label>
        <input
          type="date"
          id="end-date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="bg-gray-200 text-gray-900 p-2 rounded-lg"
        />
      </div>

      {/* Filter Button */}
      <button
        onClick={onFilterClick}
        className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 mt-7 rounded-lg"
      >
        Filter
      </button>
    </div>
  );
};

export default DatePickers;