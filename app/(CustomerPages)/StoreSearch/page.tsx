"use client";

import React, { useState } from "react";
import ProductGrid from "./Components/ProductGrid";
import Filters from "./Components/Filters";
import { ChevronDown, Filter } from "lucide-react";

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;

interface FilterState {
  sort: string;
  category: string;
  color: string[];
  material: string[];
  size: string[];
  price: {
    isCustom: boolean;
    range: [number, number];
  };
}

export default function StorePage() {
  const [filter, setFilter] = useState<FilterState>({
    sort: "none",
    category: "all",
    color: [],
    material: [],
    size: [],
    price: { isCustom: false, range: [0, 500] as [number, number] },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseine justify-between border-b border-gray-200 pb-6 pt-24">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Products
        </h1>
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
                    className={`btn btn-ghost font-medium text-left w-full block px-4 py-2 ${
                      filter.sort === option.value
                        ? "bg-gray-100 text-gray-800" // Highlight selected option
                        : "text-gray-500 hover:bg-gray-100" // Grey out other options
                    }`}
                    onClick={() => {
                      setFilter((prev) => ({
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
          <Filters filter={filter} setFilter={setFilter} />
          <ProductGrid filter={filter} />
        </div>
      </section>
    </main>
  );
}
