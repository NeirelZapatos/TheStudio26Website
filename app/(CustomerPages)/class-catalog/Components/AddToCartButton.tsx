"use client";

import { addToCart } from "@/services/cartService";

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
    <button
      onClick={handleAddToCart}
      className="text-sm px-4 py-2.5 mt-4 w-full font-semibold tracking-wide rounded-md text-white flex items-center justify-center bg-slate-800 hover:bg-slate-900"
    >
      Add to Cart
    </button>
  );
}