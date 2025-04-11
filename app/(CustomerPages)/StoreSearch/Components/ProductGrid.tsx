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

  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage] = useState(24);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();

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
      return;
    }

    const searchTermLower = filter.searchTerm.toLowerCase().trim();
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTermLower)
    );

    setFilteredProducts(filtered);
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
    filteredProducts.length > 0 ? filteredProducts : products;
  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentPosts = productsToDisplay.slice(firstPostIndex, lastPostIndex);

  if (productsToDisplay.length === 0) {
    return (
      <div className="lg:col-span-3 text-center py-8">
        No products match your search criteria.
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 min-h-0">
      {currentPosts.map((product) => (
        <ProductCard
          key={product._id}
          _id={product._id}
          name={product.name}
          price={product.price}
          image_url={product.image_url}
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
