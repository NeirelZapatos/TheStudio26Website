// app/(CustomerPages)/CheckOut/page.tsx
"use client"; // Mark this as a Client Component

import { useEffect, useState } from "react";
import CheckoutForm from "@/app/Components/CheckoutForm";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  description?: string;
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

  // Calculate the total cost of the cart
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return <div className="text-center py-8">Loading cart...</div>;
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty.</p>
          <a
            href="/class-catalog"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">${Number(item.price).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <h3 className="text-xl font-bold">Total: ${total.toFixed(2)}</h3>
          </div>
          <div className="mt-6">
            <CheckoutForm cartItems={cart} />
          </div>
        </>
      )}
    </main>
  );
}