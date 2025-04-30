"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { TruckIcon, MapPinIcon, CheckCircleIcon, ShoppingBagIcon, CreditCardIcon } from '@heroicons/react/24/outline';

import { clearCart } from "@/services/cartService";

interface CartItem {
  productId: string;
  name: string;
  price: number | string;
  quantity: number;
  image_url: string;
  description?: string;
  type?: string;
}

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
  items?: CartItem[];
}

function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    // Retrieve cart items from localStorage before making the API call
    try {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
      }
    } catch (err) {
      console.error("Error parsing cart from localStorage:", err);
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/check-out/create-checkout-session?session_id=${sessionId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order details");
        }

        const data = await response.json();
        
        // Add debug logging to see the full response
        console.log("Order details response:", data);
        
        // Ensure we preserve the original delivery method from the API
        if (data && data.deliveryMethod) {
          console.log("Delivery method from API:", data.deliveryMethod);
        }
        
        setOrderDetails(data);
        setLoading(false);

        if (data.success) {
          // Clear the cart after successful order
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

    // Safe handling of address properties
    const line1 = address.line1 || '';
    const line2 = address.line2 || '';
    
    // Format the city, state, zip as a group
    let cityStateZip = '';
    if (address.city || address.state || address.postal_code) {
      const city = address.city || '';
      const state = address.state || '';
      const zip = address.postal_code || '';
      
      if (city && (state || zip)) {
        cityStateZip = `${city}, ${state} ${zip}`.trim();
      } else {
        cityStateZip = `${city}${state}${zip}`.trim();
      }
    }
    
    const country = address.country || '';

    // Filter out empty strings
    const addressParts = [line1, line2, cityStateZip, country].filter(part => part.length > 0);
    
    return addressParts.length > 0 ? addressParts.join(", ") : "Not provided";
  };

  const formatPrice = (price: number | string): string => {
    // Convert to number if it's a string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    // Check if it's a valid number
    if (isNaN(numPrice)) {
      return '0.00';
    }

    return numPrice.toFixed(2);
  };

  // Calculate item total safely
  const calculateItemTotal = (price: number | string, quantity: number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numPrice) || isNaN(quantity)) {
      return '0.00';
    }

    return (numPrice * quantity).toFixed(2);
  };

  // Get delivery address, properly handling both shipping_details and customer_details
  const getDeliveryAddress = () => {
    if (!orderDetails) return "Not provided";
    
    // For delivery orders, use shipping_details.address as primary source
    if (orderDetails.deliveryMethod === 'delivery') {
      if (orderDetails.session.shipping_details && orderDetails.session.shipping_details.address) {
        return formatAddress(orderDetails.session.shipping_details.address);
      }
    }
    
    // Fallback to customer_details.address
    if (orderDetails.session.customer_details && orderDetails.session.customer_details.address) {
      return formatAddress(orderDetails.session.customer_details.address);
    }
    
    return "Not provided";
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

  // Make sure we're using the delivery method from the API
  const deliveryMethod = orderDetails.deliveryMethod;

  // Use stored cart items if available, otherwise use items from API
  const items = cartItems.length > 0 ? cartItems : (orderDetails.items || []);

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
            Your order has been placed successfully.
            {orderDetails.session.customer_details && orderDetails.session.customer_details.email && 
              ` We've sent a confirmation to ${orderDetails.session.customer_details.email}.`}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>

          <div className="bg-blue-50 rounded-md p-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-start">
                <ShoppingBagIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span className="font-medium">Order #{orderDetails.orderId}</span>
              </div>

              <div className="flex items-start">
                <TruckIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span>{deliveryMethod === 'pickup' ? 'Pickup in Store' : 'Delivery'}</span>
              </div>

              {/* Only show address for delivery orders */}
              {deliveryMethod === 'delivery' && (
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <span>{getDeliveryAddress()}</span>
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

          {/* Order Items Section */}
          {items.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">Purchased Items</h3>
              <div className="bg-gray-50 rounded-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center p-4">
                      <div className="flex-shrink-0 h-16 w-16 relative mr-4">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 rounded-md flex items-center justify-center">
                            <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-500">${formatPrice(item.price)} x {item.quantity}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900">${calculateItemTotal(item.price, item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-100 flex justify-between items-center border-t border-gray-200">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">${(orderDetails.session.amount_total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

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
                  <p className="font-medium">${Number((orderDetails.session.amount_total / 100).toFixed(2))}</p>
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
          
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Please save this confirmation for your records. Thank you for your purchase!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Your component logic */}
      <OrderSuccessPage />
    </Suspense>
  );
}