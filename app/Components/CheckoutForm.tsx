'use client';
import { loadStripe } from "@stripe/stripe-js";

 // Mark this as a Client Component

const CheckoutForm = ({ itemIds }: { itemIds: string[] }) => {
  const handleCheckout = async () => {
    // Create a Checkout Session with the selected item IDs
    const response = await fetch('/api/checkout/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemIds }), // Pass the item IDs to the API
    });

    const { id } = await response.json();

    // Redirect to Stripe Checkout
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
    await stripe?.redirectToCheckout({ sessionId: id });
  };

  return (
    <button onClick={handleCheckout}>
      Checkout
    </button>
  );
};

export default CheckoutForm;