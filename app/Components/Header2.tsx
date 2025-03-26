"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCart, removeFromCart } from "@/services/cartService";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
}

const Header2 = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setCartItems(getCart());
  }, [isCartOpen]); // Update cart when dropdown is toggled

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    setCartItems(getCart());
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link href="/Store">Online Store</Link>
            </li>
            <li>
              <Link href="/class-catalog">Class Catalog</Link>
            </li>
            <li>
              <Link href="/calendar">Calendar</Link>
            </li>
            <li>
              <Link href="/OpenLab">Open Lab</Link>
            </li>
            <li>
              <Link href="/GiftCards">Gift Cards</Link>
            </li>
            <li>
              <Link href="/Contact">Contact</Link>
            </li>
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl text-[#8B0000]">
          The Studio 26
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/Store">Online Store</Link>
          </li>
          <li>
            <Link href="/class-catalog">Class Catalog</Link>
          </li>
          <li>
            <Link href="/calendar">Calendar</Link>
          </li>
          <li>
            <Link href="/OpenLab">Open Lab</Link>
          </li>
          <li>
            <Link href="/GiftCards">Gift Cards</Link>
          </li>
          <li>
            <Link href="/Contact">Contact</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <div className="flex-none">
          <div className={`dropdown dropdown-end ${isCartOpen ? "open" : ""}`}>
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
              onClick={toggleCart}
            >
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            {isCartOpen && (
              <div
                tabIndex={0}
                className="card card-compact dropdown-content bg-base-100 z-[1] mt-3 w-52 shadow"
              >
                <div className="card-body">
                  <span className="text-lg font-bold">
                    {cartItems.length} Items
                  </span>
                  {cartItems.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto">
                      {cartItems.map((item) => (
                        <li key={item.productId} className="flex items-center gap-3 py-2 border-b">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              ${item.price.toFixed(2)} x {item.quantity}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500"> Your Cart is Empty</p>
                  )}
                  <h3 className="text-xl font-semibold">Subtotal: ${total.toFixed(2)}</h3>
                  
                  <div className="card-actions">
                    <Link href="/check-out">
                      <button className="btn btn-primary btn-block" onClick={closeCart}>
                        View cart
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <button className="btn btn-ghost font-medium px-3">
          <Link href="/Login">Login/Register</Link>
        </button>
      </div>
    </div>
  );
};

export default Header2;
