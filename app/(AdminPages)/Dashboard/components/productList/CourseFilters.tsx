import React from "react";

const CATEGORIES = [
  { name: "Beginning Jewelry Class", selected: false, href: "#" },
  { name: "Specialty Class", selected: false, href: "#" },
];

const CLASS_TYPES = {
  id: "classType",
  name: "Class Type",
  options: [
    { value: "ring", label: "Ring Classes" },
    { value: "earring", label: "Earring Classes" },
    { value: "pendant", label: "Pendant Classes" },
    { value: "bracelet", label: "Bracelet (Cuff) Classes" },
  ] as const,
};

const DEFAULT_CUSTOM_PRICE = [0, 50000] as [number, number];

interface FilterProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
}

interface FilterState {
  sort: string;
  category: string;
  classType: string[]; // Allow multiple selections
  price: {
    isCustom: boolean;
    range: [number, number];
  };
}

const CourseListFilters = ({ filter, setFilter }: FilterProps) => {
  const handleCategoryChange = (category: string) => {
    setFilter((prev) => ({
      ...prev,
      category, // Update the selected category
    }));
  };

  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Pick<FilterState, "classType">;
    value: string;
  }) => {
    const isFilterApplied = filter[category].includes(value);
    setFilter((prev: FilterState) => ({
      ...prev,
      [category]: isFilterApplied
        ? prev[category].filter((v: string) => v !== value) // Remove the value if it's already selected
        : [...prev[category], value], // Add the value if it's not selected
    }));
  };

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);

  return (
    <div className="drawer drawer-end">
      <input id="filter-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {/* Button to open the drawer */}
        <label
          htmlFor="filter-drawer"
          className="drawer-button btn btn-sm btn-outline ml-4"
        >
          Filters
        </label>
      </div>
      <div className="drawer-side z-10">
        <label
          htmlFor="filter-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          {/* Sidebar content */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Filters</h3>
            <label htmlFor="filter-drawer" className="btn btn-sm btn-circle">
              ✕
            </label>
          </div>
          {/* Categories Filter */}
          <ul className="space-y-4 border-b border-gray-200 pb-6 text-md font-medium text-gray-900">
            <li>
              <button
                onClick={() => handleCategoryChange("all")}
                className={`w-full text-left ${
                  filter.category === "all"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All Classes
              </button>
            </li>
            {CATEGORIES.map((category) => (
              <li key={category.name}>
                <button
                  onClick={() => handleCategoryChange(category.name)}
                  className={`w-full text-left ${
                    filter.category === category.name.toLowerCase()
                      ? "text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>

          {/* Class Types Filter */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-900">
              Class Type
            </label>
            <ul className="space-y-4 mt-2">
              {CLASS_TYPES.options.map((option, optionIdx) => (
                <li key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`classType-${optionIdx}`}
                    onChange={() => {
                      applyArrayFilter({
                        category: "classType",
                        value: option.value,
                      });
                    }}
                    checked={filter.classType.includes(option.value)}
                    className="checkbox checkbox-sm"
                  />
                  <label
                    htmlFor={`classType-${optionIdx}`}
                    className="px-2 text-sm text-gray-600"
                  >
                    {option.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-6">
            <button
              className="btn btn-outline btn-sm w-full"
              onClick={() =>
                setFilter({
                  sort: "none",
                  category: "all",
                  classType: [],
                  price: {
                    isCustom: false,
                    range: [0, 500] as [number, number],
                  },
                })
              }
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseListFilters;
