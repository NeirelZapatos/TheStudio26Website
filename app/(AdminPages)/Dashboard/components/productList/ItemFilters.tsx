import React from "react";
import SearchBar from "./SearchBar";

const SUBCATEGORIES = [
  { name: "Stones", selected: false, href: "#" },
  { name: "Jewelry", selected: false, href: "#" },
  { name: "Essentials", selected: false, href: "#" },
];

const JEWELRY_TYPE = {
  id: "jewelry_type",
  name: "Jewelry Type",
  options: [
    { value: "ring", label: "Ring" },
    { value: "necklace", label: "Necklace" },
    { value: "bracelet", label: "Bracelet" },
    { value: "earrings", label: "Earrings" },
    { value: "cuffs", label: "Cuffs" },
    { value: "pendants", label: "Pendants" },
    { value: "other", label: "Other" },
  ] as const,
};

const ESSENTIALS_TYPE = {
  id: "essentials_type",
  name: "Essentials Types",
  options: [
    { value: "Tools", label: "Tools" },
    { value: "Supplies", label: "Supplies" },
    { value: "Jewelry Kits", label: "Jewelry Kits" },
    { value: "Material and Components", label: "Materials and Components" },
  ],
};

const STONE_CUT = {
  id: "cut_category",
  name: "Stone Cut",
  options: [
    { value: "Cabochons", label: "Cabochons" },
    { value: "Faceted Stones", label: "Faceted Stones" },
    { value: "Slabs & Rough Cuts", label: "Slabs & Rough Cuts" },
    { value: "Beads & Drilled Stones", label: "Beads & Drilled Stones" },
  ] as const,
};

const PRICE_FILTERS = {
  id: "price",
  name: "Price",
  options: [
    { value: [0, 999999], label: "Any price" },
    { value: [0, 49.99], label: "$0 - $49" },
    { value: [50, 99.99], label: "$50 - $99" },
    { value: [100, 499.99], label: "$100 - $499" },
    { value: [500, 999.99], label: "$500 - $999" },
    { value: [1000, 999999], label: "$1000+" },
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
  jewelry_type: string[];
  essentials_type: string[];
  cut_category: string[];
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
    category: keyof Pick<
      FilterState,
      | "color"
      | "material"
      | "size"
      | "jewelry_type"
      | "essentials_type"
      | "cut_category"
    >;
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
            placeholder="Search products..."
          />

          {/* Categories */}
          <div className="mb-0">
            <h4 className="font-bold">Categories</h4>
            <ul className="space-y-4 pb-2 text-md font-medium text-gray-900">
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

          {/* Price Filter */}
          <div className="collapse collapse-arrow pt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title font-medium peer-checked:mb-1">
              Price
            </div>
            <div className="collapse-content animate-none">
              <ul className="grid gap-2">
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

          {/* Jewelry Type Filter */}
          <div className="collapse collapse-arrow">
            <input type="checkbox" className="peer" />
            <div className="collapse-title font-medium peer-checked:mb-1">
              Jewelry Type
            </div>
            <div className="collapse-content animate-none">
              <ul className="grid gap-2">
                {JEWELRY_TYPE.options.map((option, optionIdx) => (
                  <li key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`jewelry_type-filter-${optionIdx}`}
                      className="checkbox checkbox-sm"
                      checked={filter.jewelry_type.includes(option.value)}
                      onChange={() => {
                        applyArrayFilter({
                          category: "jewelry_type",
                          value: option.value,
                        });
                      }}
                    />
                    <label
                      htmlFor={`jewelry_type-filter-${optionIdx}`}
                      className="px-2 text-sm"
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Essentials Type Filter */}
          <div className="collapse collapse-arrow pt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title font-medium peer-checked:mb-1">
              Essentials Types
            </div>
            <div className="collapse-content animate-none">
              <ul className="grid gap-2">
                {ESSENTIALS_TYPE.options.map((option, optionIdx) => (
                  <li key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`essentials_type-filter-${optionIdx}`}
                      className="checkbox checkbox-sm"
                      checked={filter.essentials_type.includes(option.value)}
                      onChange={() => {
                        applyArrayFilter({
                          category: "essentials_type",
                          value: option.value,
                        });
                      }}
                    />
                    <label
                      htmlFor={`essentials_type-filter-${optionIdx}`}
                      className="px-2 text-sm cursor-pointer flex-1"
                    >
                      {option.label}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Stone Cut Filter */}
          <div className="collapse collapse-arrow pt-2">
            <input type="checkbox" className="peer" />
            <div className="collapse-title font-medium peer-checked:mb-1">
              Stone Cut
            </div>
            <div className="collapse-content animate-none">
              <ul className="grid gap-2">
                {STONE_CUT.options.map((option, optionIdx) => (
                  <li key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`cut_category-filter-${optionIdx}`}
                      className="checkbox checkbox-sm"
                      checked={filter.cut_category.includes(option.value)}
                      onChange={() => {
                        applyArrayFilter({
                          category: "cut_category",
                          value: option.value,
                        });
                      }}
                    />
                    <label
                      htmlFor={`cut_category-filter-${optionIdx}`}
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
                  jewelry_type: [],
                  essentials_type: [],
                  cut_category: [],
                  price: {
                    isCustom: false,
                    range: [0, 100000] as [number, number],
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
