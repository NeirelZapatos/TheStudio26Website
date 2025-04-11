import SearchBar from "../../StoreSearch/Components/SearchBar";
const CATEGORIES = [
  { name: "Beginning Jewelry Class", selected: false, href: "#" },
  { name: "Specialty Class", selected: false, href: "#" },
];

const CLASS_TYPES = {
  id: "classType",
  name: "Class Type",
  options: [
    { value: "ring", label: "Ring Classes" },
    { value: "earring", label: "Earring Classes" },
    { value: "pendant", label: "Pendant Classes" },
    { value: "bracelet", label: "Bracelet (Cuff) Classes" },
  ] as const,
};

const DEFAULT_CUSTOM_PRICE = [0, 50000] as [number, number];

interface CourseFilterProps {
  courseFilter: CourseFilterState;
  setCourseFilter: React.Dispatch<React.SetStateAction<CourseFilterState>>;
}

interface CourseFilterState {
  sort: string;
  category: string;
  classType: string[]; // Allow multiple selections
  price: {
    isCustom: boolean;
    range: [number, number];
  };
  searchTerm: string;
}

const CourseFilters = ({
  courseFilter,
  setCourseFilter,
}: CourseFilterProps) => {
  console.log(courseFilter);

  const handleCategoryChange = (category: string) => {
    setCourseFilter((prev) => ({
      ...prev,
      category, // Update the selected category
    }));
  };

  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Pick<CourseFilterState, "classType">;
    value: string;
  }) => {
    const isFilterApplied = courseFilter[category].includes(value);
    setCourseFilter((prev: CourseFilterState) => ({
      ...prev,
      [category]: isFilterApplied
        ? prev[category].filter((v: string) => v !== value) // Remove the value if it's already selected
        : [...prev[category], value], // Add the value if it's not selected
    }));
  };

  const minPrice = Math.min(
    courseFilter.price.range[0],
    courseFilter.price.range[1]
  );
  const maxPrice = Math.max(
    courseFilter.price.range[0],
    courseFilter.price.range[1]
  );

  return (
    <div className="hidden lg:block overflow-y-auto">
      <SearchBar
        onSearch={(searchTerm: string) => {
          setCourseFilter((prev) => ({
            ...prev,
            searchTerm,
          }));
        }}
        className="mb-4"
        placeholder="Search courses..."
      />
      {/* Categories Filter */}
      <ul className="space-y-4 border-b border-gray-200 pb-6 text-md font-medium text-gray-900">
        <li>
          <button
            onClick={() => handleCategoryChange("all")}
            className={`w-full text-left ${
              courseFilter.category === "all"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Classes
          </button>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category.name}>
            <button
              onClick={() => handleCategoryChange(category.name)}
              className={`w-full text-left ${
                courseFilter.category === category.name.toLowerCase()
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Class Types Filter */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-900">
          Class Type
        </label>
        <ul className="space-y-4 mt-2">
          {CLASS_TYPES.options.map((option, optionIdx) => (
            <li key={option.value} className="flex items-center">
              <input
                type="checkbox"
                id={`classType-${optionIdx}`}
                onChange={() => {
                  applyArrayFilter({
                    category: "classType",
                    value: option.value,
                  });
                }}
                checked={courseFilter.classType.includes(option.value)}
                className="checkbox checkbox-sm"
              />
              <label
                htmlFor={`classType-${optionIdx}`}
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

export default CourseFilters;
