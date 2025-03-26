"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const [orderStatus, setOrderStatus] = useState('processing');
  const [error, setError] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const processOrder = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setError('No session ID found. Unable to process your order.');
          return;
        }

        // Call your GET endpoint to process the order
        const response = await fetch(`/api/checkout/create-checkout-session?session_id=${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setOrderStatus('completed');
        } else {
          setError(data.error || 'Failed to process order');
        }
      } catch (err) {
        console.error('Error processing order:', err);
        setError('An error occurred while processing your order');
      }
    };

    processOrder();
  }, [searchParams]);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Order Confirmation</h1>
      
      {error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      ) : orderStatus === 'processing' ? (
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded mb-4">
          Processing your order...
        </div>
      ) : (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          Your order has been processed successfully!
        </div>
      )}
    </div>
  );
}