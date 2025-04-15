"use client";

import React, { useState } from "react";
import ProductGrid from "./Components/ProductGrid";
import CourseFilters from "./Components/CourseFilters";
import { ChevronDown, Filter } from "lucide-react";
import SearchBar from "@/app/(AdminPages)/Dashboard/components/productList/SearchBar";

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;
// Define multiple sets of prerequisites to choose from
// const prerequisitesPool = [
//   ["Basic metalsmithing skills", "Must be 18+ years old"],
//   ["No prior experience required", "Familiarity with hand tools"],
//   ["Basic jewelry design knowledge", "Comfortable with small materials"],
//   ["Some experience with shaping metal", "An interest in ring design"],
// ];

interface FilterState {
  sort: string;
  class_category: string;
  price: {
    isCustom: boolean;
    range: [number, number];
  };
  searchTerm: string;
}

export default function StorePage() {
  const [courseFilter, setCourseFilter] = useState<FilterState>({
    sort: "none",
    class_category: "all",
    price: { isCustom: false, range: [0, 500] as [number, number] },
    searchTerm: "",
  });

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
            Class Catalog
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl">
            Below is a comprehensive list of the classes available at our
            studio. Should you find a class of interest that is not currently
            scheduled, we encourage you to contact the studio directly. We will
            make every effort to accommodate your request; however, please note
            that most classes require a minimum of three participants to
            proceed.
          </p>
        </div>

        <div className="flex items-center">
          {/* Sort dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn m-1 btn-ghost font-medium"
            >
              Sort
              <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
            >
              {SORT_OPTIONS.map((option) => (
                <li key={option.name}>
                  <button
                    className={`btn btn-ghost font-medium text-left w-full block px-4 py-2 ${
                      courseFilter.sort === option.value
                        ? "bg-gray-100 text-gray-800"
                        : "text-gray-500 hover:bg-gray-100"
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
          </div>

          {/* Mobile filter drawer trigger button */}
          <label htmlFor="mobile-filter-drawer" className="drawer-button btn btn-ghost lg:hidden ml-2">
            <Filter className="h-5 w-5" />
            <span className="sr-only">Filters</span>
          </label>
        </div>
      </div>

      <section className="pb-24 pt-6">
        {/* Main content with drawer wrapper */}
        <div className="drawer lg:drawer-open">
          <input id="mobile-filter-drawer" type="checkbox" className="drawer-toggle" />
          
          {/* Drawer content */}
          <div className="drawer-side z-20 lg:relative">
            <label htmlFor="mobile-filter-drawer" className="drawer-overlay lg:hidden"></label>
            <div className="w-80 min-h-full bg-base-100 text-base-content pt-4 px-4 lg:pt-0">
              <div className="flex justify-between items-center lg:hidden mb-4">
                <h2 className="text-lg font-medium">Filters</h2>
                <label htmlFor="mobile-filter-drawer" className="btn btn-sm btn-ghost">✕</label>
              </div>
              <SearchBar
                onSearch={(searchTerm: string) => {
                  setCourseFilter((prev) => ({
                    ...prev,
                    searchTerm,
                  }));
                }}
                className="mb-6"
                placeholder="Search courses..."
              />
              <CourseFilters
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
              />
            </div>
          </div>
          
          {/* Main content */}
          <div className="drawer-content">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10">
              {/* Only shown on mobile */}
              {/* <div className="lg:hidden mb-4">
                <SearchBar
                  onSearch={(searchTerm: string) => {
                    setCourseFilter((prev) => ({
                      ...prev,
                      searchTerm,
                    }));
                  }}
                  className="w-full"
                  placeholder="Search courses..."
                />
              </div> */}
              
              {/* Product grid */}
              <div className="w-full">
                <ProductGrid filter={courseFilter} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}