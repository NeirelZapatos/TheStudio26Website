// app/Components/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

const CheckoutForm = ({ cartItems }: { cartItems: CartItem[] }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {

    if (isLoading || cartItems.length === 0) { return; }

    try {
      setIsLoading(true);

      // Create a Checkout Session with the cart items
      const response = await fetch("/api/check-out/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems }), // Pass the cart items to the API
      });

      const { id } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
      await stripe?.redirectToCheckout({ sessionId: id });

      setIsLoading(false);

    } catch (err) {
      console.error("Error during Checkout: " , err);
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || cartItems.length === 0;

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={isDisabled}
      className={`text-sm px-4 py-2.5 w-full font-semibold tracking-wide rounded-md text-white flex items-center justify-center ${
        isDisabled 
          ? 'bg-slate-400 cursor-not-allowed' 
          : 'bg-slate-800 hover:bg-slate-900'
      }`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        "Proceed to Checkout"
      )}
    </button>
  );
};

export default CheckoutForm;