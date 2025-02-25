import React from "react"; // Import React

/**
 * RevenueDetails Component:
 * Displays revenue details, including total revenue and revenue by category.
 * Props:
 * - financialData: Object containing revenue and category revenue data.
 * - timeFrame: The selected time frame (e.g., "Daily", "Monthly").
 * - formatRevenue: Function to format revenue as currency.
 */

interface CategoryRevenue {
  revenue: number;
}

interface FinancialData {
  revenue: number;
  categoryRevenue: Record<string, CategoryRevenue>;
}

interface RevenueDetailsProps {
  financialData: FinancialData;
  timeFrame: string;
  formatRevenue: (value: number) => string;
}

const RevenueDetails: React.FC<RevenueDetailsProps> = ({
  financialData,
  timeFrame,
  formatRevenue,
}) => {
  return (
    <>
      {/* Total Revenue Card */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-md transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col items-center">
        <p className="text-gray-600 mb-1">{timeFrame} Revenue</p>
        <h3 className="text-3xl font-bold">{formatRevenue(financialData.revenue)}</h3>
      </div>

      {/* Product Revenue Breakdown */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Product Revenue</h3>
        <div className="space-y-2">
          {Object.entries(financialData.categoryRevenue).map(([category, { revenue }]) => (
            <div
              key={category}
              className="bg-gray-200 p-4 rounded-lg flex justify-between items-center"
            >
              <strong>{category}</strong>
              <span>{formatRevenue(revenue)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RevenueDetails;