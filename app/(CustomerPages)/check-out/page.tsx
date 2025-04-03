"use client";

import { useEffect, useState } from "react";
import CartSummary from "./Components/CartSummary";
import ShippingMethodSelector from "@/app/Components/ShippingMethodSelector";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckOut, setIsCheckOut] = useState(false);

  // Fetch cart data from localStorage on component mount
  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      setCart(JSON.parse(cartData));
    }
    setLoading(false);
  }, []);

  // Remove an item from the cart
  const handleRemoveItem = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  // Update the quantity of an item in the cart
  const handleQuantityChange = (productId: string, quantity: number) => {
    const quantityCheck = Math.max(1, quantity);

    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity: quantityCheck } : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };


  if (loading) {
    return <div className="text-center py-8">Loading cart...</div>;
  }

  return (
    <div className="max-w-5xl max-md:max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-10 mt-8">
        {/* Left Col: Cart Items*/}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Your Cart</h2>
          {cart.length === 0 ? (
            <div className="flex gap-4 bg-white px-4 py-6 rounded-md shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)]">
              <p className="text-center w-full py-8 text-slate-500">Your cart is empty</p>
            </div>
          ) : (
            <CartSummary
              cart={cart}
              onRemoveItem={handleRemoveItem}
              onQuantityChange={handleQuantityChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}