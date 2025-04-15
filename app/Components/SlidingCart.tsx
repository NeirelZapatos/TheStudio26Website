'use client'

import { useState, useEffect, Fragment } from 'react'
import Link from "next/link";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { getCart, removeFromCart, updateCartItemQuantity, clearCart } from "@/services/cartService";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

interface SlidingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlidingCart = ({ isOpen, onClose }: SlidingCartProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCartItems(getCart());
    }
  }, [isOpen]);

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    setCartItems(getCart());
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateCartItemQuantity(productId, newQuantity);
      setCartItems(getCart());
    } else {
      handleRemoveItem(productId);
    }
  };

  const handleClearCart = () => {
    clearCart();
    setCartItems([]);
  };

  const handleCheckout = () => {
    alert('Proceeding to checkout');
    // TODO: IMPLEMENT CHECKOUT HERE
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Transition show={isOpen} as="div">
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as="div"
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full h-full">
              <Transition.Child
                as="div"
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
                className="h-full w-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md h-full">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">Shopping cart</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            onClick={onClose}
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {cartItems.length === 0 ? (
                            <p className="text-center py-6 text-gray-500">Your cart is empty</p>
                          ) : (
                            <ul role="list" className="-my-6 divide-y divide-gray-200">
                              {cartItems.map((item) => (
                                <li key={item.productId} className="flex py-6">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img
                                      alt={`Image of ${item.name}`}
                                      src={item.image_url}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    {/* Name and price */}
                                    <div className="flex justify-between text-base font-medium text-gray-900 mb-2">
                                      <h3>{item.name}</h3>
                                      <p className="ml-4">${item.price.toFixed(2)}</p>
                                    </div>

                                    {/* Bottom row with quantity and remove button */}
                                    <div className="flex items-center justify-between mt-auto">
                                      {/* Quantity controls */}
                                      <div className="flex items-center gap-2">
                                        <p className="text-gray-500">Qty</p>
                                        <div className="flex items-center border rounded">
                                          <button
                                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                          >
                                            -
                                          </button>
                                          <span className="px-2">{item.quantity}</span>
                                          <button
                                            className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>

                                      {/* Remove button */}
                                      <div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveItem(item.productId)}
                                          className="font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>${subtotal.toFixed(2)}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                      <div className="mt-6">
                        <Link
                          onClick={onClose}
                          href="/check-out"
                          className={`flex w-full items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm ${cartItems.length === 0
                            ? 'bg-indigo-300 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                          Checkout
                        </Link>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or{' '}
                          <button
                            type="button"
                            onClick={onClose}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            Continue Shopping
                          </button>
                        </p>
                      </div>
                      {cartItems.length > 0 && (
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={handleClearCart}
                            className="w-full text-sm text-red-500 hover:text-red-700"
                          >
                            Clear Cart
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SlidingCart