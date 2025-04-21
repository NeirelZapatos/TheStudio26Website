"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductGallery from "../../Components/ProductGallery";
import ProductDescription from "../../Components/ProductDescription";
import SuggestedProducts from "../../Components/SuggestedProducts";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  color: string;
  size: string;
  material: string;
  image_url: string;
  images: string[];
  description: string;
  quantity_in_stock: number;
  purchaseType: "Item" | "Course";
  stripeProductId?: string;
  jewelry_type: string;
  metal_type: string;
  metal_finish: string;
  metal_purity: string;
  plating: string;
  ring_size: number;
  gauge: number;
  carat_weight: number;
  setting_type: string;
  stone_arrangement: string;
  customization_options: string;
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/items/${params.id}`);
        if (!response.ok) {
          throw new Error("Product not found");
        }
        const data = await response.json();
        setProduct({
          ...data,
          price: Number(data.price),
          quantity_in_stock: Number(data.quantity_in_stock),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
      {/* Breadcrumb */}
      <nav className="flex mb-6 text-sm text-gray-500">
        <a href="/" className="hover:text-amber-600">
          Home
        </a>
        <span className="mx-2">/</span>
        <a href="/StoreSearch" className="hover:text-amber-600">
          {/* {product.category} */}
          Store
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-5 lg:gap-x-8 lg:items-start">
        <ProductGallery images={product.images || []} />
        <ProductDescription product={product} />
      </div>
      <div className="mt-16 border-t border-gray-200 pt-10">
        <SuggestedProducts />
      </div>
    </div>
  );
}
