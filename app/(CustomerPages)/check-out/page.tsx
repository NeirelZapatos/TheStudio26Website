"use client";

import { useEffect, useState } from "react";
import CartSummary from "./Components/CartSummary";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from 'next/navigation';
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryMethod: 'pickup' | 'delivery';
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'info' | 'confirmation'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // * Default Info
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    deliveryMethod: 'pickup',
  })

  // Fetch cart data from localStorage on component mount
  useEffect(() => {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      const parsedCart = JSON.parse(cartData);
      const cartWithNumberPrices = parsedCart.map((item: any) => ({
        ...item,
        price: Number(item.price)
      }));
      setCart(cartWithNumberPrices);
    }
    setLoading(false);
  }, []);

  // Remove an item from the cart
  const handleRemoveItem = (productId: string) => {
    const updatedCart = cart.filter((item) => item.productId !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  // Update the quantity of an item in the cart
  const handleQuantityChange = (productId: string, quantity: number) => {
    const quantityCheck = Math.max(1, quantity);

    const updatedCart = cart.map((item) =>
      item.productId === productId ? { ...item, quantity: quantityCheck } : item
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProceedToInfo = () => {
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }
    setError(null);
    setCheckoutStep('info');
  }

  // Handle proceeding to confirmation stage
  const handleProceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!customerInfo.firstName || !customerInfo.lastName) {
      setError("Please provide your full name");
      return;
    }

    if (!customerInfo.email && !customerInfo.phone) {
      setError("Please provide either email or phone number");
      return;
    }

    setError(null);
    setCheckoutStep('confirmation');
  };

  // Handle going back to previous stage
  const handleGoBack = () => {
    if (checkoutStep === 'info') {
      setCheckoutStep('cart');
    } else if (checkoutStep === 'confirmation') {
      setCheckoutStep('info');
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/check-out/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cart,
          customerInfo: customerInfo,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create checkout session');
      }

      const { id: sessionId } = await response.json();

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message || 'Failed to redirect to checkout');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
      console.error('Checkout error:', err);
      setIsProcessing(false);
    }
  };


  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-5xl max-md:max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-slate-900">
        {checkoutStep === 'cart' ? 'Your Cart' :
          checkoutStep === 'info' ? 'Customer Information' :
            'Order Confirmation'}
      </h1>

      {/* Checkout Stage */}
      <div className="flex justify-center my-6">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'cart' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}>1</div>
          <div className="w-12 h-1 bg-gray-200"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'info' ? 'bg-blue-600 text-white' : checkoutStep === 'confirmation' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <div className="w-12 h-1 bg-gray-200"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${checkoutStep === 'confirmation' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-10 mt-4">
        {/* Left side: Main Content */}
        <div className="md:col-span-2 space-y-4">
          {checkoutStep === 'cart' && (
            <>
              <h2 className="text-xl font-semibold">Your Cart</h2>
              {cart.length === 0 ? (
                <div className="flex gap-4 bg-white px-4 py-6 rounded-md shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)]">
                  <p className="text-center w-full py-8 text-slate-500">Your cart is empty</p>
                </div>
              ) : (
                <CartSummary
                  cart={cart}
                  onRemoveItem={handleRemoveItem}
                  onQuantityChange={handleQuantityChange}
                />
              )}
            </>
          )}

          {checkoutStep === 'info' && (
            <div className="bg-white rounded-md px-6 py-6 shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)]">
              <h2 className="text-xl font-semibold mb-4">Customer Information</h2>

              <form onSubmit={handleProceedToConfirmation}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={customerInfo.firstName}
                      onChange={handleInfoChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={customerInfo.lastName}
                      onChange={handleInfoChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={customerInfo.email}
                    onChange={handleInfoChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {!customerInfo.phone && "Either email or phone is required"}
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={customerInfo.phone}
                    onChange={handleInfoChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {!customerInfo.email && "Either email or phone is required"}
                  </p>
                </div>

                <div className="mb-6">
                  <label htmlFor="deliveryMethod" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Method*
                  </label>
                  <select
                    id="deliveryMethod"
                    name="deliveryMethod"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={customerInfo.deliveryMethod}
                    onChange={handleInfoChange}
                    required
                  >
                    <option value="pickup">Pickup</option>
                    <option value="delivery">Delivery</option>
                  </select>

                  {customerInfo.deliveryMethod === 'delivery' && (
                    <p className="text-xs text-gray-500 mt-1">
                      You'll be asked to provide your shipping address during payment.
                    </p>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={handleGoBack}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Continue to Confirmation
                  </button>
                </div>
              </form>
            </div>
          )}

          {checkoutStep === 'confirmation' && (
            <div className="bg-white rounded-md px-6 py-6 shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)]">
              <h2 className="text-xl font-semibold mb-4">Order Review</h2>

              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p><span className="font-medium">Name:</span> {customerInfo.firstName} {customerInfo.lastName}</p>
                  {customerInfo.email && <p><span className="font-medium">Email:</span> {customerInfo.email}</p>}
                  {customerInfo.phone && <p><span className="font-medium">Phone:</span> {customerInfo.phone}</p>}
                  <p><span className="font-medium">Delivery Method:</span> {customerInfo.deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'}</p>

                  {customerInfo.deliveryMethod === 'delivery' && (
                    <p className="text-sm text-gray-500 mt-2">
                      You'll enter your shipping address in the next step.
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Order Summary</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <table className="w-full">
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.productId}>
                          <td className="py-1 pr-4">{item.name}</td>
                          <td className="py-1 text-right">{item.quantity} × ${Number(item.price.toFixed(2))}</td>
                          <td className="py-1 text-right pl-4">${(item.quantity * Number(item.price)).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-gray-200">
                        <td className="py-2 font-medium" colSpan={2}>Total</td>
                        <td className="py-2 text-right pl-4 font-medium">${subtotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Edit Information
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-md px-4 py-6 shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)]">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <ul className="text-slate-900 font-medium space-y-4">
              <li className="flex justify-between text-base">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </li>
              {customerInfo.deliveryMethod === 'delivery' && (
                <li className="flex justify-between text-base">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </li>
              )}
              <li className="flex justify-between text-xl font-semibold border-t border-gray-200 pt-4">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </li>
            </ul>

            {checkoutStep === 'cart' && (
              <button
                onClick={handleProceedToInfo}
                disabled={cart.length === 0}
                className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
            )}

            {/* Continue Shopping Button */}
            <Link href="/">
              <div className="text-center mt-4">
                <span className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer">
                  Continue Shopping
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}