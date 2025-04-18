"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface SubscriptionData {
  id: string;
  name: string;
  status: string;
  current_period_end: string;
  current_period_start: string;
  stripe_subscription_id: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  cancel_at_period_end: boolean;
  price: number | null;
  interval: string;
}

function ManageSubscriptionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing access token");
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const response = await fetch(`/api/subscription-management?token=${token}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to retrieve subscription details");
        }

        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelSubscription = async () => {
    if (!token) return;
    
    setCancelling(true);
    try {
      const response = await fetch('/api/subscription-management/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          cancelImmediately: false // Always set to false to only cancel at end of period
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel subscription");
      }

      const result = await response.json();
      setCancelSuccess(result.message);
      setCancelModalOpen(false);
      
      // Refresh subscription data after cancellation
      const updatedResponse = await fetch(`/api/subscription-management?token=${token}`);
      const updatedData = await updatedResponse.json();
      setSubscription(updatedData.subscription);
    } catch (err) {
      console.error("Error canceling subscription:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center">Loading subscription details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Something went wrong</h1>
        <div className="text-red-500 mb-4">{error}</div>
        <Link href="/OpenLab">
          <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
            Return to Lab Sessions
          </button>
        </Link>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Subscription Not Found</h1>
        <p className="mb-4">We couldn't find your subscription. Please make sure you have the correct link.</p>
        <Link href="/OpenLab">
          <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
            Return to Lab Sessions
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Manage Your Subscription</h1>

      {cancelSuccess && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-100">
          {cancelSuccess}
        </div>
      )}
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">{subscription.name}</h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            subscription.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : subscription.status === 'canceled' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </span>
        </div>
        
        {subscription.price && (
          <p className="text-gray-700 mb-2">
            ${subscription.price}/{subscription.interval}
          </p>
        )}
        
        <div className="text-sm text-gray-600 mb-4">
          <p className="mb-1"><strong>Current Period:</strong> {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}</p>
          
          {subscription.cancel_at_period_end && (
            <p className="text-amber-600 font-medium mt-2">
              Your subscription will end on {formatDate(subscription.current_period_end)}
            </p>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-600 mb-2"><strong>Customer:</strong> {subscription.customer.first_name} {subscription.customer.last_name}</p>
          <p className="text-gray-600"><strong>Email:</strong> {subscription.customer.email}</p>
        </div>
      </div>
      
      {subscription.status === 'active' && !subscription.cancel_at_period_end && (
        <button
          onClick={() => setCancelModalOpen(true)}
          className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 mb-4"
        >
          Cancel Subscription
        </button>
      )}

      {subscription.cancel_at_period_end && subscription.status === 'active' && (
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800">
          <p>Your subscription is scheduled to cancel at the end of the current billing period.</p>
          <p className="mt-2">You will continue to have access until {formatDate(subscription.current_period_end)}.</p>
        </div>
      )}
      
      <Link href="/OpenLab">
        <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800">
          Return to Lab Sessions
        </button>
      </Link>
      
      {/* Cancel Modal - Simplified to only show end of period option */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Cancel Your Subscription</h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to cancel your {subscription.name} subscription?
            </p>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p>Your subscription will be canceled at the end of your current billing period ({formatDate(subscription.current_period_end)}).</p>
              <p className="mt-2">You will continue to have access to all subscription benefits until that date.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                disabled={cancelling}
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={cancelling}
              >
                {cancelling ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManageSubscriptionPage />
    </Suspense>
  );
}