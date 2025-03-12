"use client";

import React, { useState } from "react";
import ProductGrid from "./Components/ProductGrid";
import CourseFilters from "./Components/CourseFilters"
import { ChevronDown, Filter } from "lucide-react";

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;

// Define multiple sets of prerequisites to choose from
const prerequisitesPool = [
  ["Basic metalsmithing skills", "Must be 18+ years old"],
  ["No prior experience required", "Familiarity with hand tools"],
  ["Basic jewelry design knowledge", "Comfortable with small materials"],
  ["Some experience with shaping metal", "An interest in ring design"],
];

interface FilterState {
  sort: string;
  category: string;
  classType: string[];
  price: {
    isCustom: boolean;
    range: [number, number];
  };
}

export default function StorePage() {
  const [courseFilter, setCourseFilter] = useState<FilterState>({
    sort: "none",
    category: "all",
    classType: [], // Default class type
    price: { isCustom: false, range: [0, 500] as [number, number] },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseine justify-between border-b border-gray-200 pb-6 pt-24">
      <div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Class Catalog
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl">
          Below is a comprehensive list of the classes available at our studio. 
          Should you find a class of interest that is not currently scheduled, we encourage you to contact the studio directly. 
          We will make every effort to accommodate your request; 
          however, please note that most classes require a minimum of three participants to proceed.
        </p>
      </div>
        {/* Dropdown menu to sort by asc/desc */}
        <div className="flex items-center">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn m-1 btn-ghost font-medium"
            >
              Sort
              <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"></ChevronDown>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              {SORT_OPTIONS.map((option) => (
                <li key={option.name}>
                  <button
                    className={`btn btn-ghost font-medium text-left w-full block px-4 py-2 ${courseFilter.sort === option.value
                        ? "bg-gray-100 text-gray-800" // Highlight selected option
                        : "text-gray-500 hover:bg-gray-100" // Grey out other options
                      }`}
                    onClick={() => {
                      setCourseFilter((prev) => ({
                        ...prev,
                        sort: option.value,
                      }));
                    }}
                  >
                    {option.name}
                  </button>
                </li>
              ))}
            </ul>
            <button className="-m-2 m1-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filters */}
          <CourseFilters courseFilter={courseFilter} setCourseFilter={setCourseFilter} />
          <ProductGrid filter={courseFilter} />
        </div>
      </section>
    </main>
  );
}
