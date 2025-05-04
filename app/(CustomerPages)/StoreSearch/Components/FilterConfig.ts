export type FilterOption = {
  value: string;
  label: string;
};

export type PriceFilterOption = {
  value: [number, number];
  label: string;
};

export type FilterCategory =
  | "category"
  | "jewelry_type"
  | "color"
  | "material"
  | "size"
  | "metal_type"
  | "metal_purity"
  | "customization_options"
  | "clarity"
  | "cut_category"
  | "certification_available"
  | "essentials_type";

export type FilterType = "checkbox" | "radio" | "dropdown";

export interface FilterDefinition {
  id: string;
  name: string;
  type: FilterType;
  options: FilterOption[];
  category: FilterCategory;
}

export interface PriceFilterDefinition {
  id: string;
  name: string;
  options: PriceFilterOption[];
}

export const CATEGORIES = [
  { name: "All Items", value: "all" },
  { name: "Stones", value: "Stones" },
  { name: "Jewelry", value: "Jewelry" },
  { name: "Essentials", value: "Essentials" },
  { name: "Miscellaneous", value: "Miscellaneous" },
];

export const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;

export const FILTER_DEFINITIONS: FilterDefinition[] = [
  {
    id: "jewelry_type",
    name: "Jewelry Type",
    type: "checkbox",
    category: "jewelry_type",
    options: [
      { value: "ring", label: "Ring" },
      { value: "necklace", label: "Necklace" },
      { value: "bracelet", label: "Bracelet" },
      { value: "earrings", label: "Earrings" },
      { value: "cuffs", label: "Cuffs" },
      { value: "pendants", label: "Pendants" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "essentials_type",
    name: "Essentials Types",
    type: "checkbox",
    category: "essentials_type",
    options: [
      { value: "Tools", label: "Tools" },
      { value: "Supplies", label: "Supplies" },
      { value: "Jewelry Kits", label: "Jewelry Kits" },
      { value: "Material and Components", label: "Materials and Components" },
    ],
  },
  {
    id: "cut_category",
    name: "Stone Cut",
    type: "checkbox",
    category: "cut_category",
    options: [
      { value: "Cabochons", label: "Cabochons" },
      { value: "Faceted Stones", label: "Faceted Stones" },
      { value: "Slabs & Rough Cuts", label: "Slabs & Rough Cuts" },
      { value: "Beads & Drilled Stones", label: "Beads & Drilled Stones" },
    ],
  },
  {
    id: "color",
    name: "Color",
    type: "checkbox",
    category: "color",
    options: [
      { value: "gold", label: "Gold" },
      { value: "rose gold", label: "Rose Gold" },
      { value: "white gold", label: "White Gold" },
      { value: "silver", label: "Silver" },
      { value: "platinum", label: "Platinum" },
      { value: "black", label: "Black" },
      { value: "bronze", label: "Bronze" },
      { value: "copper", label: "Copper" },
      { value: "red", label: "Red" },
      { value: "pink", label: "Pink" },
      { value: "blue", label: "Blue" },
      { value: "green", label: "Green" },
      { value: "purple", label: "Purple" },
      { value: "yellow", label: "Yellow" },
      { value: "orange", label: "Orange" },
      { value: "white/clear", label: "White/Clear" },
      { value: "brown", label: "Brown" },
      { value: "multicolor", label: "Multicolor" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "material",
    name: "Material",
    type: "checkbox",
    category: "material",
    options: [
      { value: "gold", label: "Gold" },
      { value: "copper", label: "Copper" },
      { value: "silver", label: "Silver" },
    ],
  },
  {
    id: "size",
    name: "Ring Size",
    type: "checkbox",
    category: "size",
    options: [
      { value: "3", label: "US 3" },
      { value: "4", label: "US 4" },
      { value: "5", label: "US 5" },
      { value: "6", label: "US 6" },
      { value: "7", label: "US 7" },
      { value: "8", label: "US 8" },
      { value: "9", label: "US 9" },
      { value: "10", label: "US 10" },
      { value: "11", label: "US 11" },
      { value: "12", label: "US 12" },
      { value: "13", label: "US 13" },
      { value: "14", label: "US 14" },
      { value: "15", label: "US 15" },
    ],
  },
  {
    id: "metal_type",
    name: "Metal Type",
    type: "checkbox",
    category: "metal_type",
    options: [
      { value: "gold", label: "Gold" },
      { value: "silver", label: "Silver" },
      { value: "platinum", label: "Platinum" },
      { value: "copper", label: "Copper" },
      { value: "bronze", label: "Bronze" },
      { value: "mixed metals", label: "Mixed" },
    ],
  },
  {
    id: "metal_purity",
    name: "Metal Purity",
    type: "checkbox",
    category: "metal_purity",
    options: [
      { value: "10k", label: "10K" },
      { value: "14k", label: "14K" },
      { value: "18k", label: "18K" },
      { value: "22k", label: "22K" },
      { value: "24k", label: "24K" },
      { value: "sterling silver", label: "Sterling Silver" },
      { value: "fine silver", label: "Fine Silver" },
    ],
  },
  {
    id: "clarity",
    name: "Stone Clarity",
    type: "checkbox",
    category: "clarity",
    options: [
      { value: "FL", label: "Flawless" },
      { value: "IF", label: "Internally Flawless" },
      { value: "VVS1", label: "Very Very Slightly Included 1" },
      { value: "VVS2", label: "Very Very Slightly Included 2" },
      { value: "VS1", label: "Very Slightly Included 1" },
      { value: "VS2", label: "Very Slightly Included 2" },
      { value: "SI1", label: "Slightly Included 1" },
      { value: "SI2", label: "Slightly Included 2" },
      { value: "I1", label: "Included 1" },
      { value: "I2", label: "Included 2" },
      { value: "I3", label: "Included 3" },
      { value: "Cloudy", label: "Cloudy" },
      { value: "Heavily Included", label: "Heavily Included" },
      { value: "Near-Opaque", label: "Near-Opaque" },
    ],
  },
  // {
  //   id: "customization_options",
  //   name: "Customization Options",
  //   type: "checkbox",
  //   category: "customization_options",
  //   options: [
  //     { value: "engraving", label: "Engraving Available" },
  //     { value: "stone setting", label: "Stone Setting Available" },
  //     { value: "custom design", label: "Custom Design Available" },
  //   ],
  // },
  {
    id: "certification_available",
    name: "Stone Certification Available",
    type: "checkbox",
    category: "certification_available",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
  },
];


export const PRICE_FILTER: PriceFilterDefinition = {
  id: "price",
  name: "Price",
  options: [
    { value: [0, 999999], label: "Any price" },
    { value: [0, 49.99], label: "$0 - $49" },
    { value: [50, 99.99], label: "$50 - $99" },
    { value: [100, 499.99], label: "$100 - $499" },
    { value: [500, 999.99], label: "$500 - $999" },
    { value: [1000, 999999], label: "$1000+" },
    { value: [-1, -1], label: "Custom"},
  ],
};

export const DEFAULT_FILTER_STATE = {
  sort: "none",
  category: "all",
  jewelry_type: [],
  color: [],
  material: [],
  size: [],
  metal_type: [],
  metal_purity: [],
  customization_options: [],
  clarity: [],
  cut_category: [],
  certification_available: [],
  essentials_type: [],
  price: {
    isCustom: false,
    range: [0, 999999] as [number, number],
    customMin: 0,
    customMax: 0,
  },
  searchTerm: "",
};

export type FilterState = typeof DEFAULT_FILTER_STATE;
