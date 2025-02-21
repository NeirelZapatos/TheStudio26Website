'use client'; // Mark this as a Client Component

import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function StripeTestPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Call the API route to create a Checkout Session
      const response = await fetch('/api/embedded-checkout', {
        method: 'POST',
      });
      const session = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const result = await stripe!.redirectToCheckout({ sessionId: session.id });

      if (result.error) {
        alert(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Stripe Test Page</h1>
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}