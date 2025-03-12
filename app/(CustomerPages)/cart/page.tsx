// app/cart/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CartSummary from "./components/CartSummary";
import CheckoutForm from "@/app/Components/CheckoutForm";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Fetch cart data from localStorage on component mount
  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      setCart(JSON.parse(cartData));
    }
  }, []);

  // Remove an item from the cart
  const handleRemoveItem = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  // Update the quantity of an item in the cart
  const handleQuantityChange = (productId: string, quantity: number) => {
    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <Link
            href="/class-catalog"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <CartSummary
            cart={cart}
            onRemoveItem={handleRemoveItem}
            onQuantityChange={handleQuantityChange}
          />
          <CheckoutForm cartItems={cart} />
        </>
      )}
    </main>
  );
}