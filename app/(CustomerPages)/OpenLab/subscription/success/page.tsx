"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface SubscriptionData {
  subscriptionId: string;
  message: string;
  managementUrl?: string; // Add this property to fix the TypeScript error
  managementToken?: string;
  subscription: {
    name: string;
    status: string;
    current_period_end?: Date;
    current_period_start?: Date;
    stripe_subscription_id: string;
  };
  session: {
    id: string;
    customer_details: {
      email: string;
      name: string;
    };
    payment_status: string;
  };
}

function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch(`/api/lab-subscription/create-checkout-session?session_id=${sessionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to verify subscription");
        }

        const data = await response.json();
        setSubscriptionData(data);
      } catch (err) {
        console.error("Error fetching subscription status:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center">Processing your subscription...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Something went wrong</h1>
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => router.push("/OpenLab")} 
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        >
          Return to Lab Sessions
        </button>
      </div>
    );
  }

  if (!subscriptionData) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Subscription Status Unknown</h1>
        <p className="mb-4">We couldn't verify your subscription status. Please contact support.</p>
        <Link href="/OpenLab">
          <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
            Return to Lab Sessions
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Subscription Successful!</h1>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="font-semibold text-lg mb-2">{subscriptionData.subscription.name}</p>
        <p className="text-green-600 font-medium mb-4">
          Status: {subscriptionData.subscription.status}
        </p>
        
        <div className="text-sm text-gray-600 mb-2">
          <p><strong>Email:</strong> {subscriptionData.session.customer_details.email}</p>
          <p><strong>Name:</strong> {subscriptionData.session.customer_details.name}</p>
          {subscriptionData.subscription.current_period_start && (
            <p><strong>Current Period Start:</strong> {new Date(subscriptionData.subscription.current_period_start).toLocaleDateString()}</p>
          )}
          {subscriptionData.subscription.current_period_end && (
            <p><strong>Current Period End:</strong> {new Date(subscriptionData.subscription.current_period_end).toLocaleDateString()}</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-center text-gray-700 mb-4">
          Thank you for subscribing to the Silver Lab Bundle! You'll receive a confirmation email shortly.
        </p>
        
        {subscriptionData.managementUrl && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
            <p className="text-blue-800 mb-2">You can manage your subscription using this link:</p>
            <a 
              href={subscriptionData.managementUrl}
              className="text-blue-600 underline block text-center break-words"
            >
              {subscriptionData.managementUrl}
            </a>
            <p className="text-sm text-blue-800 mt-2">
              ⚠️ Save this link to view or cancel your subscription in the future
            </p>
          </div>
        )}
        
        <div className="text-center mt-4 text-gray-600">
          <p>Lost your management link? You can always request a new one from our</p>
          <Link href="/OpenLab/subscription/portal">
            <span className="text-blue-600 hover:underline cursor-pointer">
              subscription management portal
            </span>
          </Link>
        </div>
      </div>
      
      <Link href="/OpenLab">
        <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800">
          Return to Lab Sessions
        </button>
      </Link>
    </div>
  );
}

export default function SubscriptionSuccess() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Your component logic */}
      <SubscriptionSuccessPage />
      {/* Add any other components or logic here */}
    </Suspense>
  );
}