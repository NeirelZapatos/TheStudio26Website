"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import ProductSkeleton from "./ProductSkeleton";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  color: string;
  size: string;
  material: string;
  image_url: string;
  description: string;
  quantity_in_stock: number;
  purchaseType: "Item" | "Course";
  stripeProductId?: string;
}

interface FilterConfig {
  sort: string;
  category: string;
  color: string[];
  material: string[];
  size: string[];
  jewelry_type: string[];
  metal_type: string[];
  metal_purity: string[];
  customization_options: string[];
  cut_category: string[];
  clarity: string[];
  certification_available: string[];
  essentials_type: string[];
  price: { range: [number, number] };
  searchTerm?: string;
}

interface ProductGridProps {
  filter: FilterConfig;
}

export default function ProductGrid({ filter }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noSearchResults, setNoSearchResults] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage] = useState(24);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();

        if (filter.price.range[0] !== 0 || filter.price.range[1] !== 500) {
          params.append("minPrice", filter.price.range[0].toString());
          params.append("maxPrice", filter.price.range[1].toString());
        }

        if (filter.sort !== "none") {
          params.append("sort", filter.sort);
        }

        if (filter.category && filter.category !== "all") {
          params.append("category", filter.category);
        }

        const arrayFilters = [
          "color",
          "material",
          "size",
          "jewelry_type",
          "metal_type",
          "metal_purity",
          "customization_options",
          "cut_category",
          "clarity",
          "certification_available",
          "essentials_type",
        ];

        arrayFilters.forEach((key) => {
          const filterKey = key as keyof FilterConfig;
          const filterValue = filter[filterKey] as string[];

          if (filterValue && filterValue.length > 0) {
            params.append(key, filterValue.join(","));
          }
        });

        // params.append("minPrice", filter.price.range[0].toString());
        // params.append("maxPrice", filter.price.range[1].toString());

        console.log("Fetching with params:", params.toString());
        const response = await fetch(`/api/items?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);
        setNoSearchResults(false); // Reset search results state
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filter)]);

  // Client side search filter
  useEffect(() => {
    if (!filter.searchTerm || filter.searchTerm.trim() === "") {
      setFilteredProducts(products);
      setNoSearchResults(false);
      return;
    }

    const searchTermLower = filter.searchTerm.toLowerCase().trim();
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTermLower)
    );

    setFilteredProducts(filtered);
    setNoSearchResults(filtered.length === 0);
    setCurrentPage(1);
  }, [products, filter.searchTerm]);

  if (loading) {
    return (
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 min-h-0">
        {Array(postPerPage)
          .fill(0)
          .map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  const productsToDisplay =
    filteredProducts.length > 0 || filter.searchTerm ? filteredProducts : products;
  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentPosts = productsToDisplay.slice(firstPostIndex, lastPostIndex);

  if (noSearchResults) {
    return (
      <div className="lg:col-span-3 text-center py-8">
        <div className="p-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products match your search</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      </div>
    );
  }

  if (productsToDisplay.length === 0) {
    return (
      <div className="lg:col-span-3 text-center py-8">
        <div className="p-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products match your filters</h3>
          <p className="text-gray-500">Try adjusting your filter criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 min-h-0">
      {currentPosts.map((product) => (
        <ProductCard
          key={product._id}
          _id={product._id}
          name={product.name}
          price={product.price}
          image_url={product.image_url}
          quantity_in_stock={product.quantity_in_stock}
        />
      ))}
      <div className="col-span-full flex justify-center mt-8">
        <Pagination
          totalPosts={productsToDisplay.length}
          postsPerPage={postPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}