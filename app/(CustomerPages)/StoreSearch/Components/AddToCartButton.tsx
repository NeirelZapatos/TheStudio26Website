"use client";

import { addToCart } from "@/services/cartService";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const handleAddToCart = () => {
    const item = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    };

    addToCart(item);
    alert("Item added to cart!");
  };

  return (
    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <button
      onClick={(e) => {
        e.preventDefault(); //prevents navigation when button is clicked
        handleAddToCart();
      }}
      className="bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-md hover:bg-blue-500 hover:text-white transition-colors duration-200"
    >
      <ShoppingCart size={20} />
    </button>
  </div>
  );
}