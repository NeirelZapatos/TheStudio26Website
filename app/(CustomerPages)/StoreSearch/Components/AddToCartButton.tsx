"use client";

import { addToCart } from "@/services/cartService";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image_url: string;
    quantity_in_stock?: number;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [buttonText, setButtonText] = useState("Add to Cart");

  const handleAddToCart = () => {
    const item = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    };

    addToCart(item);

    setIsAdding(true);
    setButtonText("Added to Cart!");

    setTimeout(() => {
      setIsAdding(false);
      setButtonText("Add to Cart");
    }, 2000); // Change the button text after 2 seconds
  };

  return (
    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <button
      onClick={(e) => {
        e.preventDefault(); //prevents navigation when button is clicked
        handleAddToCart();
      }}
      className="bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-md hover:bg-amber-500 hover:text-gray transition-colors duration-200"
    >
      <ShoppingCart size={20} />
    </button>
  </div>
  );
}