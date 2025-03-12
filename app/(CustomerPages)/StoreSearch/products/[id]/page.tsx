"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import "react-medium-image-zoom/dist/styles.css";
import SuggestedProducts from "../../Components/SuggestedProducts";
import ProductSpecs from "../../Components/ProductSpecifications";
import ProductGallery from "../../Components/ProductGallery";

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
  const [quantity, setQuantity] = useState(1);

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
        Loading...
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

  const formattedPrice =
    typeof product.price === "number"
      ? product.price.toFixed(2)
      : Number(product.price).toFixed(2);

  const maxQuantity = Math.max(0, Math.min(10, product.quantity_in_stock));
  const quantityOptions =
    maxQuantity > 0 ? Array.from({ length: maxQuantity }, (_, i) => i + 1) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
        {/* Image gallery */}
        <ProductGallery images={product.images || []} />

        {/* Product info */}
        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {product.name}
          </h1>

          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900">
              ${formattedPrice}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <p className="text-base text-gray-500">{product.description}</p>
          </div>

          <div className="mt-8">
            {product.quantity_in_stock > 0 && (
              <p>Quantity
              <div className="flex items-center">
                <label htmlFor="quantity" className="sr-only">
                  Quantity
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="select select-bordered w-20"
                >
                  {quantityOptions.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              </p>
            )}
            <div className="flex items-center space-x-4 py-5">
              {product.quantity_in_stock > 0 ? (
                <button className="btn flex-1">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </button>
              ) : (
                <button className="btn flex-1" disabled>
                  Out of Stock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <ProductSpecs product={product} />
      <SuggestedProducts />
    </div>
  );
}
