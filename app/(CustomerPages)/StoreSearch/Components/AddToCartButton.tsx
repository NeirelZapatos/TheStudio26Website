"use client";

import { addToCart } from "@/services/cartService";
import { useState } from "react";

interface AddToCartButtonProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image_url: string;
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
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`text-sm px-4 py-2.5 mt-4 w-full font-semibold tracking-wide rounded-md text-white flex items-center justify-center ${isAdding
        ? "bg-green-600 hover:bg-green-600"
        : "bg-slate-800 hover:bg-slate-900"
        } transition-colors duration-300`}
    >
      {buttonText}
    </button>
  );
}