"use client"

import React, { useState } from "react";
import EmailList from "../../Components/EmailList";
import Image from "next/image";

const ClassCatalog: React.FC = () => {
  const [filters, setFilters] = useState({
    availability: false,
    priceRange: [0, 1000],
    experienceLevel: [],
  });

  const toggleAvailability = () => {
    setFilters({ ...filters, availability: !filters.availability });
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const newRange = [...filters.priceRange];
    if (type === "min") newRange[0] = Number(event.target.value);
    if (type === "max") newRange[1] = Number(event.target.value);
    setFilters({ ...filters, priceRange: newRange });
  };

  // ! FIX THIS
  // const toggleExperienceLevel = (level: string) => {
  //   setFilters((prev) => {
  //     const newLevels = prev.experienceLevel.includes(level)
  //       ? prev.experienceLevel.filter((l) => l !== level)
  //       : [...prev.experienceLevel, level];
  //     return { ...prev, experienceLevel: newLevels };
  //   });
  // };

  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Class Catalog</h1>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row md:gap-6">
          <div className="w-full md:w-1/4 bg-gray-100 p-4 rounded-lg">
            <h2 className="font-semibold text-lg mb-4">Filters</h2>

            {/* Availability Filter */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.availability}
                  onChange={toggleAvailability}
                  className="form-checkbox text-red-500"
                />
                <span>Available</span>
              </label>
            </div>

            {/* Price Range Filter */}
            <div className="mb-4">
              <label className="block mb-2 font-semibold">Price Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange(e, "min")}
                  className="w-1/2 p-2 border rounded-lg"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange(e, "max")}
                  className="w-1/2 p-2 border rounded-lg"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Experience Level Filter */}
            <div>
              <label className="block mb-2 font-semibold">Experience Level</label>
              <div className="flex flex-col space-y-2">

                { /* // ! FIX THIS */ }
                {/* {["Beginner", "Intermediate", "Advanced"].map((level) => (
                  <label key={level} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.experienceLevel.includes(level)}
                      onChange={() => toggleExperienceLevel(level)}
                      className="form-checkbox text-red-500"
                    />
                    <span>{level}</span>
                  </label>
                ))} */}


              </div>
            </div>
          </div>

          {/* Class Display Section */}
          <div className="w-full md:w-3/4">
            <h2 className="text-xl font-semibold mb-4">Classes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Example Class Card */}
              <div className="border p-4 rounded-lg shadow">
                <Image
                  src="https://picsum.photos/300"   //for reference
                  alt="Class"
                  width={300}
                  height={300}
                  className="w-full h-40 object-cover mb-4 rounded"
                />
                <h3 className="text-lg font-bold">Sample Class Name</h3>
                <p className="text-sm text-gray-500">Beginner</p>
                <p className="mt-2 text-red-500 font-semibold">$100</p>
              </div>
              {/*additional class cards */}
            </div>
          </div>
        </div>
      </div>

      <EmailList />
    </div>
  );
};

export default ClassCatalog;