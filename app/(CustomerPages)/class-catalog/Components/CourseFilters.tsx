import React from "react";

const CATEGORIES = [
  { name: "All Classes", value: "all" },
  { name: "Beginning Jewelry", value: "Beginning Jewelry Class" },
  { name: "Specialty Classes", value: "Specialty Class" },
  { name: "Ring Classes", value: "Ring Class" },
  { name: "Earring Classes", value: "Earring Class" },
  { name: "Bracelet Classes", value: "Bracelet Class" },
  { name: "Pendant Classes", value: "Pendant Class" },
  { name: "Other", value: "Other" },
];

const PRICE_RANGES = [
  { name: "All", value: [0, 999999] },
  { name: "$0 - $99", value: [0, 99] },
  { name: "$100 - $199", value: [100, 199] },
  { name: "$200 - $299", value: [200, 299] },
  { name: "$300+", value: [300, 999999] },
];

interface CourseFilterProps {
  courseFilter: CourseFilterState;
  setCourseFilter: React.Dispatch<React.SetStateAction<CourseFilterState>>;
  onClose?: () => void;
}

interface CourseFilterState {
  sort: string;
  class_category: string;
  price: {
    isCustom: boolean;
    range: [number, number];
  };
  searchTerm: string;
}

const CourseFilters = ({
  courseFilter,
  setCourseFilter,
  onClose,
}: CourseFilterProps) => {
  const handleCategoryChange = (class_category: string) => {
    setCourseFilter((prev) => ({
      ...prev,
      class_category,
    }));
    
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handlePriceChange = (range: [number, number]) => {
    setCourseFilter((prev) => ({
      ...prev,
      price: {
        isCustom: false,
        range,
      },
    }));
    
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div className="overflow-y-auto pb-6">

      {/* Categories Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
        <ul className="space-y-2">
          {CATEGORIES.map((category) => (
            <li key={category.value}>
              <button
                onClick={() => handleCategoryChange(category.value)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  courseFilter.class_category === category.value
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Price Filter (needs design work) */} 
      {/* <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Price Range</h3>
        <ul className="space-y-2">
          {PRICE_RANGES.map((range, idx) => (
            <li key={idx}>
              <button
                onClick={() => handlePriceChange(range.value as [number, number])}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  courseFilter.price.range[0] === range.value[0] && 
                  courseFilter.price.range[1] === range.value[1]
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {range.name}
              </button>
            </li>
          ))}
        </ul>
      </div> */}
    
    </div>
  );
};

export default CourseFilters;