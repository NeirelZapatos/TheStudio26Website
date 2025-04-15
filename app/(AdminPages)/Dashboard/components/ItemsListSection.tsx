"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ItemCard from "./productList/ItemCard";
import ItemViewModal from "./productList/ItemViewModal";
import ItemFilters from "./productList/ItemFilters";
import { Item } from "./productList/ItemTypes";

const ItemsListSection: React.FC = () => {
  type FilterState = {
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
  };

  // Data States
  const [filter, setFilter] = useState<FilterState>({
    sort: "none",
    category: "all",
    color: [],
    material: [],
    size: [],
    jewelry_type: [],
    essentials_type: [],
    cut_category: [],
    price: { isCustom: false, range: [0, 500] as [number, number] },
    searchTerm: "",
  });

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Fetch items on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/items", {
          params: {
            search: filter.searchTerm,
            category: filter.category,
          },
        });
        setItems(response.data);
      } catch (err) {
        setError(true);
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    // Add debouncing for better performance
    const debounceTimer = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, []); // Add filter as dependency

  // Handle item click to open view modal
  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };

  // Close view modal
  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  // Delete item
  const handleDeleteItem = async (item: Item) => {
    try {
      await axios.delete(`/api/items/${item._id}`);
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      setSelectedItem(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item. Please try again.");
    }
  };

  // Filter items based on selected filters
  const getFilteredItems = () => {
    return items.filter((item) => {
      if (
        filter.searchTerm &&
        !item.name?.toLowerCase().includes(filter.searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Apply category filter
      if (
        filter.category !== "all" &&
        item.category?.toLowerCase() !== filter.category
      ) {
        return false;
      }

      // Apply color filter
      if (
        filter.color.length > 0 &&
        (!item.color || !filter.color.includes(item.color.toLowerCase()))
      ) {
        return false;
      }

      // Apply material filter
      if (
        filter.material.length > 0 &&
        (!item.material ||
          !filter.material.includes(item.material.toLowerCase()))
      ) {
        return false;
      }

      // Apply size filter
      if (
        filter.size.length > 0 &&
        (!item.size || !filter.size.includes(item.size))
      ) {
        return false;
      }

      // Apply jewelry type filter
      if (
        filter.jewelry_type.length > 0 &&
        (!item.jewelry_type || !filter.jewelry_type.includes(item.jewelry_type))
      ) {
        return false;
      }

      // Apply essentials type filter
      if (
        filter.essentials_type.length > 0 &&
        (!item.essentials_type ||
          !filter.essentials_type.includes(item.essentials_type))
      ) {
        return false;
      }

      // Apply stone cut filter
      if (
        filter.cut_category.length > 0 &&
        (!item.cut_category || !filter.cut_category.includes(item.cut_category))
      ) {
        return false;
      }

      // Apply price filter
      const itemPrice =
        typeof item.price === "string" ? parseFloat(item.price) : item.price;
      if (
        itemPrice !== undefined &&
        !isNaN(Number(itemPrice)) &&
        (Number(itemPrice) < filter.price.range[0] ||
          Number(itemPrice) > filter.price.range[1])
      ) {
        return false;
      }

      return true;
    });
  };

  const filteredItems = getFilteredItems();

  // Sort items based on selected sort option
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (filter.sort === "price-asc") {
      const priceA =
        typeof a.price === "string" ? parseFloat(a.price) : a.price || 0;
      const priceB =
        typeof b.price === "string" ? parseFloat(b.price) : b.price || 0;
      return Number(priceA) - Number(priceB);
    } else if (filter.sort === "price-desc") {
      const priceA =
        typeof a.price === "string" ? parseFloat(a.price) : a.price || 0;
      const priceB =
        typeof b.price === "string" ? parseFloat(b.price) : b.price || 0;
      return Number(priceB) - Number(priceA);
    } else if (filter.sort === "name-asc") {
      return (a.name || "").localeCompare(b.name || "");
    } else if (filter.sort === "name-desc") {
      return (b.name || "").localeCompare(a.name || "");
    }
    return 0;
  });

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-error text-xl mb-4">Error loading products</div>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          <select
            value={filter.sort}
            onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
            className="select select-bordered select-sm"
          >
            <option value="none">Default Sort</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>

          {/* Your Filter Drawer Component */}
          <ItemFilters filter={filter} setFilter={setFilter} />
        </div>
      </div>

      <div className="w-full">
        {sortedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] bg-base-200 rounded-lg p-8">
            <p className="text-xl text-base-content mb-4">
              No items match your filters
            </p>
            <button
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
                    range: [0, 500] as [number, number],
                  },
                })
              }
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-base-content opacity-70">
                {sortedItems.length} products found
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-base-100 shadow rounded-lg p-4 hover:shadow-lg transition"
                >
                  <ItemCard item={item} onClick={() => handleItemClick(item)} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* View Modal (instead of Edit Modal) */}
      {selectedItem && (
        <ItemViewModal
          item={selectedItem}
          onClose={handleCloseModal}
          onDelete={handleDeleteItem}
        />
      )}
    </div>
  );
};

export default ItemsListSection;
