import { useEffect } from "react";
import {
  CATEGORIES,
  FILTER_DEFINITIONS,
  PRICE_FILTER,
  DEFAULT_FILTER_STATE,
  FilterDefinition,
  FilterState,
} from "./FilterConfig";

interface FilterProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  mobileOpen?: boolean;
  onClose?: () => void;
}

const Filters = ({ filter, setFilter, mobileOpen, onClose }: FilterProps) => {
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleCategoryChange = (category: string) => {
    setFilter((prev) => ({
      ...prev,
      category,
    }));
  };

  const applyArrayFilter = (category: keyof FilterState, value: string) => {
    const isFilterApplied = (filter[category] as string[]).includes(value);
    setFilter((prev: FilterState) => ({
      ...prev,
      [category]: isFilterApplied
        ? (prev[category] as string[]).filter((v) => v !== value)
        : [...(prev[category] as string[]), value],
    }));
  };

  const handlePriceFilter = (range: [number, number]) => {
    setFilter((prev: FilterState) => ({
      ...prev,
      price: {
        isCustom: false,
        range: range,
      },
    }));
  };

  const resetFilters = () => {
    setFilter(DEFAULT_FILTER_STATE);
  };

  const renderFilterGroup = (filterDef: FilterDefinition) => {
    return (
      <div key={filterDef.id} className="collapse collapse-arrow">
        <input type="checkbox" name={`accordion-${filterDef.id}`} />
        <div className="collapse-title text-med text-gray-400 hover:text-gray-500">
          <span className="font-medium text-gray-900">{filterDef.name}</span>
        </div>
        <div className="collapse-content animate-none">
          <ul className="space-y-4">
            {filterDef.options.map((option, optionIdx) => (
              <li key={option.value} className="flex items-center">
                <input
                  type={filterDef.type === "radio" ? "radio" : "checkbox"}
                  id={`${filterDef.id}-${optionIdx}`}
                  onChange={() => {
                    applyArrayFilter(filterDef.category, option.value);
                  }}
                  checked={(filter[filterDef.category] as string[]).includes(
                    option.value
                  )}
                  className={
                    filterDef.type === "radio"
                      ? "radio"
                      : "checkbox checkbox-sm"
                  }
                />
                <label
                  htmlFor={`${filterDef.id}-${optionIdx}`}
                  className="px-2 text-sm text-gray-600"
                >
                  {option.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderPriceFilter = () => {
    return (
      <div className="collapse collapse-arrow">
        <input type="checkbox" name="price-accordion" />
        <div className="collapse-title text-med text-gray-400 hover:text-gray-500">
          <span className="font-medium text-gray-900">Price</span>
        </div>
        <div className="collapse-content animate-none">
          <ul className="space-y-4">
            {PRICE_FILTER.options.map((option, optionIdx) => (
              <li key={option.label} className="flex items-center">
                <input
                  type="radio"
                  id={`price-${optionIdx}`}
                  onChange={() => {
                    handlePriceFilter(option.value);
                  }}
                  checked={
                    !filter.price.isCustom &&
                    filter.price.range[0] === option.value[0] &&
                    filter.price.range[1] === option.value[1]
                  }
                  className="radio"
                />
                <label
                  htmlFor={`price-${optionIdx}`}
                  className="px-2 text-sm text-gray-600"
                >
                  {option.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-y-auto pr-4">
      {/* Category Selection */}
      <ul className="space-y-2 border-b border-gray-200 pb-6 text-md font-medium">
        {CATEGORIES.map((category) => (
          <li key={category.value}>
            <button
              onClick={() => handleCategoryChange(category.value)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                filter.category === category.value
                  ? "bg-blue-100 text-blue-700 font-semibold border-blue-500"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>

      {renderPriceFilter()}

      {/* Dynamically render all filter groups */}
      {FILTER_DEFINITIONS.map(renderFilterGroup)}

      {/* Clear Filters Button */}
      <div className="mt-6">
        <button
          className="btn btn-outline btn-sm w-full"
          onClick={resetFilters}
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default Filters;
