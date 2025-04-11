import React from "react";
import SearchBar from "./SearchBar";

const SUBCATEGORIES = [
  { name: "Stones", selected: false, href: "#" },
  { name: "Jewelry", selected: false, href: "#" },
  { name: "Supplies", selected: false, href: "#" },
];

const COLOR_FILTERS = {
  id: "color",
  name: "Color",
  options: [
    { value: "white", label: "White" },
    { value: "beige", label: "Beige" },
    { value: "silver", label: "Silver" },
    { value: "gold", label: "Gold" },
    { value: "black", label: "Black" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "red", label: "Red" },
  ] as const,
};

const MATERIAL_FILTERS = {
  id: "material",
  name: "Material",
  options: [
    { value: "gold", label: "Gold" },
    { value: "copper", label: "Copper" },
    { value: "silver", label: "Silver" },
  ] as const,
};

const SIZE_FILTERS = {
  id: "size",
  name: "Size",
  options: [
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
  ] as const,
};

const PRICE_FILTERS = {
  id: "price",
  name: "Price",
  options: [
    { value: [0, 500], label: "Any price" },
    { value: [0, 49], label: "$0 - $49" },
    { value: [50, 99], label: "$50 - $99" },
    { value: [100, 500], label: "$100 - $500" },
  ] as const,
};

const CUT_FILTERS = {
  id: "cut",
  name: "Cut",
  options: [
    { value: "round", label: "Round" },
    { value: "oval", label: "Oval" },
    { value: "pear", label: "Pear" },
    { value: "emerald", label: "Emerald" },
    { value: "princess", label: "Princess" },
    { value: "marquise", label: "Marquise" },
    { value: "heart", label: "Heart" },
    { value: "cushion", label: "Cushion" },
  ] as const,
};

interface FilterProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
}

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
  searchTerm?: string;
}

const ItemFilters = ({ filter, setFilter }: FilterProps) => {
  const handleCategoryChange = (category: string) => {
    setFilter((prev) => ({
      ...prev,
      category,
    }));
  };

  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Pick<FilterState, "color" | "material" | "size">;
    value: string;
  }) => {
    const isFilterApplied = filter[category].includes(value);
    setFilter((prev: FilterState) => ({
      ...prev,
      [category]: isFilterApplied
        ? prev[category].filter((v: string) => v !== value)
        : [...prev[category], value],
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
            placeholder="Search products..."
          />

          {/* Categories */}
          <div className="mb-0">
            <h4 className="font-bold">Categories</h4>
            <ul className="space-y-4 pb-6 text-md font-medium text-gray-900">
              <li>
                <button
                  onClick={() => handleCategoryChange("all")}
                  className={`w-full text-left px-2 py-1 rounded-md ${
                    filter.category === "all"
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-base-300"
                  }`}
                >
                  All Items
                </button>
              </li>
              {SUBCATEGORIES.map((category) => (
                <li key={category.name}>
                  <button
                    onClick={() =>
                      handleCategoryChange(category.name.toLowerCase())
                    }
                    className={`w-full text-left px-2 py-1 rounded-md ${
                      filter.category === category.name.toLowerCase()
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
          <div className="divider"></div>

          {/* Color Filter */}
          <div className="collapse collapse-arrow">
            <input type="checkbox" className="peer" />
            <div className="collapse-title font-medium peer-checked:mb-1">
              Color
            </div>
            <div className="collapse-content animate-none">
              <ul className="grid grid-cols-4 gap-2">
                {COLOR_FILTERS.options.map((option, optionIdx) => (
                  <li key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`color-filter-${optionIdx}`}
                      className="checkbox checkbox-sm"
                      checked={filter.color.includes(option.value)}
                      onChange={() => {
                        applyArrayFilter({
                          category: "color",
                          value: option.value,
                        });
                      }}
                    />
                    <label
                      htmlFor={`color-filter-${optionIdx}`}
                      className="px-2 text-sm"
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Material Filter */}
          <div className="collapse collapse-arrow border-t pt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title font-medium peer-checked:mb-1">
              Material
            </div>
            <div className="collapse-content px-1 pt-0">
              <ul className="grid grid-cols-4 gap-2">
                {MATERIAL_FILTERS.options.map((option, optionIdx) => (
                  <li key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`material-filter-${optionIdx}`}
                      className="checkbox checkbox-sm"
                      checked={filter.material.includes(option.value)}
                      onChange={() => {
                        applyArrayFilter({
                          category: "material",
                          value: option.value,
                        });
                      }}
                    />
                    <label
                      htmlFor={`material-filter-${optionIdx}`}
                      className="px-2 text-sm cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Size Filter */}
          <div className="collapse collapse-arrow border-t pt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title font-medium peer-checked:mb-1">
              Size
            </div>
            <div className="collapse-content px-1 pt-0">
              <ul className="grid grid-cols-4 gap-2">
                {SIZE_FILTERS.options.map((option, optionIdx) => (
                  <li key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`size-filter-${optionIdx}`}
                      className="checkbox checkbox-sm"
                      checked={filter.size.includes(option.value)}
                      onChange={() => {
                        applyArrayFilter({
                          category: "size",
                          value: option.value,
                        });
                      }}
                    />
                    <label
                      htmlFor={`size-filter-${optionIdx}`}
                      className="px-2 text-sm cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cut Filter */}
          <div className="collapse collapse-arrow border-t pt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title font-medium peer-checked:mb-1">
              Cut Type
            </div>
            <div className="collapse-content px-1 pt-0">
              <ul className="grid grid-cols-4 gap-2">
                {CUT_FILTERS.options.map((option, optionIdx) => (
                  <li key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`cut-filter-${optionIdx}`}
                      className="checkbox checkbox-sm"
                      checked={filter.size.includes(option.value)}
                      onChange={() => {
                        applyArrayFilter({
                          category: "size",
                          value: option.value,
                        });
                      }}
                    />
                    <label
                      htmlFor={`cut-filter-${optionIdx}`}
                      className="px-2 text-sm cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Price Filter */}
          <div className="collapse collapse-arrow border-t pt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title font-medium peer-checked:mb-1">
              Price
            </div>
            <div className="collapse-content px-1 pt-0">
              <ul className="grid grid-cols-4 gap-2">
                {PRICE_FILTERS.options.map((option, optionIdx) => (
                  <li key={option.label} className="flex items-center">
                    <input
                      type="radio"
                      id={`price-filter-${optionIdx}`}
                      name="price-filter"
                      className="radio radio-sm"
                      checked={
                        !filter.price.isCustom &&
                        filter.price.range[0] === option.value[0] &&
                        filter.price.range[1] === option.value[1]
                      }
                      onChange={() => {
                        setFilter((prev: FilterState) => ({
                          ...prev,
                          price: {
                            isCustom: false,
                            range: [...option.value] as [number, number],
                          },
                        }));
                      }}
                    />
                    <label
                      htmlFor={`price-filter-${optionIdx}`}
                      className="px-2 text-sm cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="mt-6">
            <button
              className="btn btn-outline btn-sm w-full"
              onClick={() =>
                setFilter({
                  sort: "none",
                  category: "all",
                  color: [],
                  material: [],
                  size: [],
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemFilters;
