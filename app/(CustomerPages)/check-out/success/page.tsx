"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { TruckIcon, MapPinIcon, CheckCircleIcon, ShoppingBagIcon, CreditCardIcon } from '@heroicons/react/24/outline';

import { clearCart } from "@/services/cartService";

interface OrderDetails {
  success: boolean;
  orderId: string;
  deliveryMethod: 'pickup' | 'delivery';
  message: string;
  session: {
    id: string;
    amount_total: number;
    customer_details: {
      email: string;
      name: string;
      phone?: string;
      address?: {
        city: string;
        country: string;
        line1: string;
        line2?: string;
        postal_code: string;
        state: string;
      };
    };
    shipping_details?: {
      address: {
        city: string;
        country: string;
        line1: string;
        line2?: string;
        postal_code: string;
        state: string;
      };
      name: string;
    };
    payment_status: string;
  };
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/check-out/create-checkout-session?session_id=${sessionId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order details");
        }

        const data = await response.json();
        setOrderDetails(data);
        setLoading(false);

        if (data.success) {
          clearCart();
        }
        
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Could not load order details. Please contact support.");
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  const formatAddress = (address: any) => {
    if (!address) return "Not provided";

    const addressParts = [
      address.line1,
      address.line2,
      `${address.city}, ${address.state} ${address.postal_code}`,
      address.country
    ].filter(Boolean);

    return addressParts.join(", ");
  };

  if (loading) {
    return <div className="text-center py-16">Loading order details...</div>;
  }

  if (error || !orderDetails) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Could not find order details"}
        </div>
        <Link href="/">
          <div className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Continue Shopping
          </div>
        </Link>
      </div>
    );
  }

  const deliveryMethod = orderDetails.deliveryMethod === 'pickup' ? 'pickup' : 'delivery';

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-md shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)] p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600">
            Your order has been placed successfully. We've sent a confirmation to {orderDetails.session.customer_details.email}.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>

          <div className="bg-blue-50 rounded-md p-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <ShoppingBagIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span className="font-medium">Order #{orderDetails.orderId.substring(0, 8)}</span>
              </div>

              <div className="flex items-start">
                <TruckIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span>{orderDetails.deliveryMethod === 'pickup' ? 'Pickup in Store' : 'Delivery'}</span>
              </div>

              {orderDetails.deliveryMethod === 'delivery' && (
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <span>{formatAddress(orderDetails.session.customer_details.address)}</span>
                </div>
              )}

              <div className="flex items-start">
                <CreditCardIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span>
                  Payment Status: {' '}
                  <span className={orderDetails.session.payment_status === 'paid' ? 'text-green-600 font-medium' : ''}>
                    {orderDetails.session.payment_status === 'paid' ? 'Paid' : orderDetails.session.payment_status}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{orderDetails.session.customer_details.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{orderDetails.session.customer_details.email}</p>
                </div>
                {orderDetails.session.customer_details.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{orderDetails.session.customer_details.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="font-medium">${(orderDetails.session.amount_total / 100).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {deliveryMethod === 'pickup' && (
            <div className="mb-6 bg-yellow-50 p-4 rounded-md">
              <h3 className="font-medium text-yellow-800 mb-2">Pickup Information</h3>
              <p className="text-yellow-700">
                Please bring your order confirmation email and a valid ID when picking up your order.
              </p>
            </div>
          )}

          {deliveryMethod === 'delivery' && (
            <div className="mb-6 bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Delivery Information</h3>
              <p className="text-blue-700">
                Your items will be delivered to the address provided. You'll receive shipping updates via email.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Please save this confirmation for your records. Thank you for your purchase!
            </p>
            <div className="flex justify-center space-x-4 pt-2">
              <Link href="/shop">
                <div className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Continue Shopping
                </div>
              </Link>
              <Link href="/account/orders">
                <div className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                  View My Orders
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}