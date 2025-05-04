"use client";

import React, { useState } from "react";
import ProductGrid from "./Components/ProductGrid";
import CourseFilters from "./Components/CourseFilters";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import SearchBar from "@/app/(AdminPages)/Dashboard/components/productList/SearchBar";

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;

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
    price: { isCustom: false, range: [0, 100000] as [number, number] },
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

          {/* Mobile filter button */}
          <label
            htmlFor="filter-drawer"
            className="btn btn-ghost lg:hidden ml-4"
          >
            <SlidersHorizontal />
          </label>
        </div>
      </div>

      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Desktop Filters */}
          <div className="hidden sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto lg:block">
            <div className="mb-3 mr-4">
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
            </div>
            <CourseFilters
              courseFilter={courseFilter}
              setCourseFilter={setCourseFilter}
            />
          </div>

          {/* Mobile Drawer */}
          <div className="drawer drawer-end lg:hidden z-50">
            <input
              id="filter-drawer"
              type="checkbox"
              className="drawer-toggle"
            />
            <div className="drawer-side">
              <label htmlFor="filter-drawer" className="drawer-overlay"></label>
              <div className="p-4 w-80 min-h-full bg-base-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <label
                    htmlFor="filter-drawer"
                    className="btn btn-ghost btn-circle"
                  >
                    ✕
                  </label>
                </div>
                <div className="mb-4">
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
                </div>
                <CourseFilters
                  courseFilter={courseFilter}
                  setCourseFilter={setCourseFilter}
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            <ProductGrid filter={courseFilter} />
          </div>
        </div>
      </section>
    </main>
  );
}
