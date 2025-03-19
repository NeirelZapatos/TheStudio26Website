"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
// import { Pagination } from "@mui/material";
import Pagination from "./Pagination";

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

interface ProductGridProps {
  filter: {
    sort: string;
    category: string;
    color: string[];
    material: string[];
    size: string[];
    price: { range: [number, number] };
  };
}

export default function ProductGrid({ filter }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostsPerPage] = useState(9);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();

        // Only add parameters if they have values
        if (filter.sort !== "none") {
          params.append("sort", filter.sort);
        }
        if (filter.category && filter.category !== "all") {
          params.append("category", filter.category);
        }
        if (filter.color.length > 0) {
          params.append("color", filter.color.join(","));
        }
        if (filter.material.length > 0) {
          params.append("material", filter.material.join(","));
        }
        if (filter.size.length > 0) {
          params.append("size", filter.size.join(","));
        }
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
  }, [filter]);

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const currentPosts = products.slice(firstPostIndex, lastPostIndex);

  return (
    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 min-h-0">
      {currentPosts.map((product) => (
        <ProductCard
          key={product._id}
          _id={product._id}
          name={product.name}
          price={product.price}
          category={product.category}
          image_url={product.image_url}
        />
      ))}
      <div className="col-span-full flex justify-center mt-8">
        <Pagination
          totalPosts={products.length}
          postsPerPage={postPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
