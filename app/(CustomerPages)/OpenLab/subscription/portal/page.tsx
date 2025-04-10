"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function SubscriptionPortalPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/subscription-management/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send management link");
      }

      setSuccess(true);
    } catch (err) {
      console.error("Error requesting access:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Subscription Management</h1>
      
      {!success ? (
        <>
          <p className="mb-6 text-gray-700">
            Enter the email address associated with your subscription to receive a management link.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? "Sending..." : "Send Management Link"}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md border border-green-100">
            <p>Management link has been sent to {email}</p>
            <p className="text-sm mt-2">
              Please check your email and follow the link to manage your subscription.
            </p>
          </div>
          
          <p className="mb-6 text-gray-600 text-sm">
            If you don't receive the email within a few minutes, please check your spam folder
            or try again.
          </p>
          
          <button
            onClick={() => {
              setSuccess(false);
              setEmail("");
            }}
            className="text-blue-600 underline"
          >
            Try a different email
          </button>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link href="/OpenLab">
          <button className="w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300">
            Back to Lab Sessions
          </button>
        </Link>
      </div>
    </div>
  );
}