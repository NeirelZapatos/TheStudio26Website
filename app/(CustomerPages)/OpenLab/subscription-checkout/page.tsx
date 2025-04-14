"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

// Replace with your Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface SubscriptionPlan {
  _id: string;
  name: string;
  price: number;
  description: string;
  stripePriceId: string;
  interval: string;
}

export default function SubscriptionCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get('id') || "67edc949208b99bf25cd4da0"; // Default to Silver Lab Bundle
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Fetch subscription details
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch(`/api/subscriptions/${subscriptionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch subscription details");
        }
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError("Error loading subscription details");
        console.error(err);
      }
    };

    fetchSubscription();
  }, [subscriptionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscription) {
      setError("Subscription details not loaded");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/lab-subscription/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionInfo: {
            subscriptionId: subscription._id,
            stripePriceId: subscription.stripePriceId,
            quantity: 1,
          },
          contactInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        });

        if (error) {
          throw error;
        }
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => router.back()} 
          className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center">Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Subscribe to {subscription.name}</h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="font-semibold">{subscription.name}</p>
        <p className="text-gray-600 text-sm mb-2">{subscription.description}</p>
        <p className="font-bold">${subscription.price}/{subscription.interval}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="firstName" className="block text-gray-700 mb-1">First Name *</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="lastName" className="block text-gray-700 mb-1">Last Name *</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-1">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="phone" className="block text-gray-700 mb-1">Phone (Optional)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : `Subscribe - $${subscription.price}/${subscription.interval}`}
        </button>
      </form>
    </div>
  );
}