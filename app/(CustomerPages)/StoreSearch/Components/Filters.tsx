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

const DEFAULT_CUSTOM_PRICE = [0, 500] as [number, number];

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
  searchTerm: string;
}

const Filters = ({ filter, setFilter }: FilterProps) => {
  //console.log(filter);

  const handleCategoryChange = (category: string) => {
    setFilter((prev) => ({
      ...prev,
      category, // Update the selected category
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
    <div className="hidden lg:block overflow-y-auto">
      <SearchBar
        onSearch={(searchTerm: string) => {
          setFilter((prev) => ({
            ...prev,
            searchTerm,
          }));
        }}
        className="mb-4"
        placeholder="Search products..."
      />

      <ul className="space-y-2 border-b border-gray-200 pb-6 text-md font-medium">
        <li>
          <button
            onClick={() => handleCategoryChange("all")}
            className={`w-full text-left px-3 py-2 rounded-md ${
              filter.category === "all"
                ? "bg-blue-100 text-blue-700 font-semibold border-blue-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Items
          </button>
        </li>
        {SUBCATEGORIES.map((category) => (
          <li key={category.name}>
            <button
              onClick={() => handleCategoryChange(category.name)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                filter.category.toLowerCase() === category.name.toLowerCase()
                  ? "bg-blue-100 text-blue-700 font-semibold border-blue-500"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Accordion */}
      {/* Color Filters */}
      <div className="collapse collapse-arrow">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title text-med text-gray-400 hover:text-gray-500">
          <span className="font-medium text-gray-900">Color</span>
        </div>
        <div className="collapse-content animate-none">
          <ul className="space-y-4">
            {COLOR_FILTERS.options.map((option, optionIdx) => (
              <li key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`color-${optionIdx}`}
                  onChange={() => {
                    applyArrayFilter({
                      category: "color",
                      value: option.value,
                    });
                  }}
                  checked={filter.color.includes(option.value)}
                  className="checkbox checkbox-sm"
                />
                <label
                  htmlFor={`color-${optionIdx}`}
                  className="px-2 text-sm text-gray-600"
                >
                  {option.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Prices Filter */}
      <div className="collapse collapse-arrow">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title text-med text-gray-400 hover:text-gray-500">
          <span className="font-medium text-gray-900">Price</span>
        </div>
        <div className="collapse-content animate-none">
          <ul className="space-y-4">
            {PRICE_FILTERS.options.map((option, optionIdx) => (
              <li key={option.label} className="flex items-center">
                <input
                  type="radio"
                  id={`price-${optionIdx}`}
                  onChange={() => {
                    setFilter((prev: FilterState) => ({
                      ...prev,
                      price: {
                        isCustom: false,
                        range: [...option.value],
                      },
                    }));
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
            {/* <li className="flex justify-center flex-col gap-2">
              <div className="flex justify-between">
                <p className="font-medium">Price</p>
                <div>
                  ${minPrice.toFixed(0)} - ${Number(maxPrice).toFixed(0)}
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="range"
                  min={0}
                  max={500}
                  value={maxPrice}
                  onChange={(e) => {
                    const newMax = Number(e.target.value);
                    setFilter((prev: FilterState) => ({
                      ...prev,
                      price: {
                        ...prev.price,
                        range: [prev.price.range[0], newMax],
                      },
                    }));
                  }}
                  className="range range-sm"
                />
              </div>
            </li> */}
          </ul>
        </div>
      </div>

      {/* Materials Filter */}
      <div className="collapse collapse-arrow">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title text-med text-gray-400 hover:text-gray-500">
          <span className="font-medium text-gray-900">Material</span>
        </div>
        <div className="collapse-content animate-none">
          <ul className="space-y-4">
            {MATERIAL_FILTERS.options.map((option, optionIdx) => (
              <li key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`material-${optionIdx}`}
                  onChange={() => {
                    applyArrayFilter({
                      category: "material",
                      value: option.value,
                    });
                  }}
                  checked={filter.material.includes(option.value)}
                  className="checkbox checkbox-sm"
                />
                <label
                  htmlFor={`material-${optionIdx}`}
                  className="px-2 text-sm text-gray-600"
                >
                  {option.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sizes Filter */}
      <div className="collapse collapse-arrow">
        <input type="checkbox" name="my-accordion-2" />
        <div className="collapse-title text-med text-gray-400 hover:text-gray-500">
          <span className="font-medium text-gray-900">Size</span>
        </div>
        <div className="collapse-content animate-none">
          <ul className="space-y-4">
            {SIZE_FILTERS.options.map((option, optionIdx) => (
              <li key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`size-${optionIdx}`}
                  onChange={() => {
                    applyArrayFilter({
                      category: "size",
                      value: option.value,
                    });
                  }}
                  checked={filter.size.includes(option.value)}
                  className="checkbox checkbox-sm"
                />
                <label
                  htmlFor={`size-${optionIdx}`}
                  className="px-2 text-sm text-gray-600"
                >
                  {option.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Filters;
