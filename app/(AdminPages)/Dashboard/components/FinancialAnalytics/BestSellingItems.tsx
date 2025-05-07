import React from "react";

/**
 * BestSellingItems Component:
 * Displays the Top 3 Best Selling Items for each category.
 *
 * Props:
 * - bestSellingItems: Object containing arrays of top-selling items for each category.
 */
interface BestSellingItem {
  name: string;
  sales: number;
}

interface BestSellingItemsProps {
  bestSellingItems: {
    Jewelry: BestSellingItem[];
    Stones: BestSellingItem[];
    Essentials: BestSellingItem[];
    Courses: BestSellingItem[];
  };
}

const BestSellingItems: React.FC<BestSellingItemsProps> = ({ bestSellingItems }) => {

    if (!bestSellingItems) return null;
    
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mt-6">
          <h3 className="text-lg font-semibold mb-4">Top 3 Best-Selling Items</h3>
    
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {Object.entries(bestSellingItems).map(([category, items]) => (
              <div key={category} className="bg-gray-100 p-4 rounded-lg shadow-md">
                <h4 className="text-md font-semibold mb-2">{`Top 3 in ${category}`}</h4>
                <ul className="space-y-2" aria-label={`Top 3 best-selling items in ${category}`}>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{item.name}</span>
                        <span className="font-semibold">{item.sales} sales</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No data available</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </section>
      );
};

export default BestSellingItems;