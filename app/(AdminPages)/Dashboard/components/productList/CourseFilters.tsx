import React from "react";
import SearchBar from "./SearchBar";

const CATEGORIES = [
  { name: "Beginning Jewelry Class", selected: false, href: "#" },
  { name: "Specialty Class", selected: false, href: "#" },
  { name: "Ring Class", selected: false, href: "#"},
  { name: "Earring Class", selected: false, href: "#"},
  { name: "Bracelet Class", selected: false, href: "#"},
  { name: "Pendant Class", selected: false, href: "#"},
  { name: "Other", selected: false, href: "#"},
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
  class_category: string;
  classType: string[]; // Allow multiple selections
  price: {
    isCustom: boolean;
    range: [number, number];
  };
  searchTerm?: string;
}

const CourseListFilters = ({ filter, setFilter }: FilterProps) => {
  const handleCategoryChange = (class_category: string) => {
    setFilter((prev) => ({
      ...prev,
      class_category, // Update the selected category
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

  // const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
  // const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);

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
        <div className="p-4 w-80 min-h-full bg-base-200 text-base-content">
          {/* Sidebar content */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Filters</h3>
            <label htmlFor="filter-drawer" className="btn btn-sm btn-circle">
              ✕
            </label>
          </div>
          {/* Search Bar */}
          <SearchBar
            onSearch={(searchTerm: string) => {
              setFilter((prev) => ({
                ...prev,
                searchTerm,
              }));
            }}
            value={filter.searchTerm}
            className="mb-4"
            placeholder="Search courses..."
          />
          {/* Categories Filter */}
          <div className="mb-0">
            <h4 className="font-bold">Categories</h4>
            <ul className="space-y-4 pb-2 text-md font-medium text-gray-900">
              <li>
                <button
                  onClick={() => handleCategoryChange("all")}
                  className={`w-full text-left px-2 py-1 rounded-md ${
                    filter.class_category === "all"
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-base-300"
                  }`}
                >
                  All Classes
                </button>
              </li>
              {CATEGORIES.map((category) => (
                <li key={category.name}>
                  <button
                    onClick={() => handleCategoryChange(category.name.toLowerCase())}
                    className={`w-full text-left px-2 py-1 rounded-md ${
                      filter.class_category === category.name.toLowerCase()
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-base-300"
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Clear Filters Button */}
          {/* <div className="mt-6">
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
                  searchTerm: "",
                })
              }
            >
              Clear All Filters
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CourseListFilters;
