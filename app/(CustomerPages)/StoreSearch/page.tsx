"use client";

import React, { useState } from "react";
import ProductGrid from "./Components/ProductGrid";
import Filters from "./Components/Filters";
import SearchBar from "./Components/SearchBar";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";
import {
  DEFAULT_FILTER_STATE,
  FilterState,
  SORT_OPTIONS,
} from "./Components/FilterConfig";

export default function StorePage() {
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER_STATE);

  const handleSortChange = (sortValue: string) => {
    setFilter((prev) => ({
      ...prev,
      sort: sortValue,
    }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilter((prev) => ({
      ...prev,
      searchTerm,
    }));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Products
        </h1>
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
                    className={`btn btn-ghost font-medium text-left w-full block px-4 py-2 ${
                      filter.sort === option.value
                        ? "bg-blue-300 text-gray-800"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => handleSortChange(option.value)}
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
          <div className="hidden sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto lg:block">
            <div className="mb-3 mr-4 hidden lg:block">
              <SearchBar
                onSearch={handleSearch}
                value={filter.searchTerm}
                placeholder="Search products..."
              />
            </div>
            <Filters filter={filter} setFilter={setFilter} />
          </div>
          <div className="drawer drawer-end lg:hidden z-50">
            <input
              id="filter-drawer"
              type="checkbox"
              className="drawer-toggle"
            />
            <div className="drawer-side">
              <label
                htmlFor="filter-drawer"
                aria-label="close sidebar"
                className="drawer-overlay"
              ></label>
              <div className="p-4 w-80 min-h-full bg-base-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <label
                    htmlFor="filter-drawer"
                    className="btn btn-ghost btn-circle"
                  >
                    <X className="h-5 w-5" />
                  </label>
                </div>
                <div className="mb-4 mr-4">
                  <SearchBar
                    onSearch={handleSearch}
                    value={filter.searchTerm}
                    placeholder="Search products..."
                  />
                </div>
                <Filters filter={filter} setFilter={setFilter} />
              </div>
            </div>
          </div>
          <ProductGrid filter={filter} />
        </div>
      </section>
    </main>
  );
}