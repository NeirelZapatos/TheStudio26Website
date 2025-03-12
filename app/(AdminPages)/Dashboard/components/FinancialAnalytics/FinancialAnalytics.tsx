import React, { useMemo } from "react"; // Import React
import DatePickers from "./DatePickers"; // Import DatePickers component
import RevenueOptions from "./RevenueOptions"; // Import RevenueOptions component
import RevenueDetails from "./RevenueDetails"; // Import RevenueDetails component
import useFinancialData from "./hooks/useFinancialData"; // Import custom hook for financial data
import useOrderData from "./hooks/useOrderData"; // Import custom hook for order data

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

/**
 * FinancialAnalytics Component:
 * Displays financial analytics data, including revenue and product revenue breakdown.
 * Uses custom hooks (`useFinancialData` and `useOrderData`) to fetch and manage data.
 *
 * Custom Hook Design Pattern:
 * The custom hook design pattern is used here to encapsulate reusable logic for fetching
 * financial data and managing order data. This pattern separates concerns by moving logic
 * out of the component and into reusable hooks, making the code more modular and easier
 * to maintain.
 *
 * - `useFinancialData`: Handles fetching and formatting financial data, such as revenue
 *   and category revenue. It manages the state for financial data, loading status, and
 *   errors, and provides functionality for filtering data by date range.
 * - `useOrderData`: Manages fetching, creating, updating, and deleting orders. It encapsulates
 *   logic for interacting with the API and updating the state.
 *
 * Benefits of Using Custom Hooks:
 * 1. **Reusability**: The same logic can be reused across multiple components.
 * 2. **Separation of Concerns**: Logic is separated from the UI, making components cleaner
 *    and easier to understand.
 * 3. **Testability**: Custom hooks can be tested independently of the components that use them.
 * 4. **Simplicity**: Reduces the complexity of components by abstracting away logic.
 *
 * How We Use It:
 * - The `useFinancialData` hook fetches and formats financial data, which is then displayed
 *   in the `RevenueDetails` component. It also handles filtering data based on a selected
 *   time frame or custom date range.
 * - The `useOrderData` hook fetches and manages order data, which is used to provide context
 *   for financial analytics (e.g., revenue breakdown by product category).
 */

const FinancialAnalytics: React.FC = () => {
  // Destructure values from the `useFinancialData` hook
  const { 
    financialData, // Financial data (revenue and category revenue)
    timeFrame, // Selected time frame (e.g., "Daily", "Monthly")
    setTimeFrame, // Function to update the time frame
    isLoading, // Loading state
    error, // Error message (if any)
    startDate, // Start date for date range filtering
    setStartDate, // Function to update the start date
    endDate, // End date for date range filtering
    setEndDate, // Function to update the end date
    fetchDataByDateRange, // Function to fetch data based on a date range
    formatRevenue // Function to format revenue as currency
  } = useFinancialData();


  //Might refactor later into utility hooks for using and fetching order data
  // Fetch order data using the `useOrderData` hook
  //const { orders } = useOrderData();

  // Define product categories and time frames for filtering
  //const productCategories = ["All Categories", "Courses", "Jewelry", "Stones", "Supplies"];
// Memoize RevenueDetails to avoid unnecessary re-renders
const memoizedRevenueDetails = useMemo(() => (
  <RevenueDetails
    financialData={financialData}
    timeFrame={timeFrame}
    formatRevenue={formatRevenue}
  />
), [financialData, timeFrame, formatRevenue]);

const revenueChartData = useMemo(() => ({
  labels: Object.keys(financialData.categoryRevenue), // Categories as labels
  datasets: [
    {
      label: "Revenue ($)",
      data: Object.values(financialData.categoryRevenue).map((cat) => cat.revenue),
      borderColor: "rgb(75, 192, 192)", // Teal-colored line
      backgroundColor: "rgba(75, 192, 192, 0.2)", // Light teal fill
      fill: true,
    },
  ],
}), [financialData]);

return (
  <section className="bg-white text-gray-900 shadow-lg rounded-lg p-6 my-6">
    <h2 className="text-2xl font-semibold mb-6">Financial Analytics</h2>

    {/* Revenue Section */}
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Revenue:</h3>
      <div className="flex flex-wrap items-center justify-between">
        <RevenueOptions timeFrame={timeFrame} setTimeFrame={setTimeFrame} />
        <DatePickers
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onFilterClick={fetchDataByDateRange}
        />
      </div>
    </div>

    {/* Loading, Error, or Revenue Details */}
    {isLoading ? (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    ) : error ? (
      <div className="text-red-500">
        <p>{error}</p>
        <button 
          onClick={fetchDataByDateRange} 
          className="bg-red-500 text-white px-3 py-1 rounded-lg mt-3"
        >
          Retry
        </button>
      </div>
    ) : (
      <>
        <RevenueDetails
          financialData={financialData}
          timeFrame={timeFrame}
          formatRevenue={formatRevenue}
        />

        {/* Revenue Trend Graph */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
          <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            <Line data={revenueChartData} options={{ responsive: true }} />
          </div>
        </div>
      </>
    )}
  </section>
);
};

export default FinancialAnalytics;