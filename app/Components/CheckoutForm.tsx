// app/Components/CheckoutForm.tsx
"use client";

import { loadStripe } from "@stripe/stripe-js";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

const CheckoutForm = ({ cartItems }: { cartItems: CartItem[] }) => {
  const handleCheckout = async () => {
    // Create a Checkout Session with the cart items
    const response = await fetch("/api/checkout/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItems }), // Pass the cart items to the API
    });

    const { id } = await response.json();

    // Redirect to Stripe Checkout
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
    await stripe?.redirectToCheckout({ sessionId: id });
  };

  return (
    <button
      onClick={handleCheckout}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
    >
      Proceed to Checkout
    </button>
  );
};

export default CheckoutForm;