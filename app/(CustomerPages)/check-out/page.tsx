"use client";

import { useEffect, useState } from "react";
import CartSummary from "./Components/CartSummary";

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
    <>
      <CartSummary
        cart={cart}
        onRemoveItem={handleRemoveItem}
        onQuantityChange={handleQuantityChange}
      />
    </>

  );
}