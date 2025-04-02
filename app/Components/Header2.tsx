"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCart } from "@/services/cartService";
import SlidingCart from "@/app/Components/SlidingCart";

// interface CartItem {
//   productId: string;
//   name: string;
//   price: number;
//   quantity: number;
//   image_url: string;
// }

const Header2 = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  const updateCartCount = () => {
    const items = getCart();
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    setCartItemCount(totalQuantity);
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener('cart-updated', updateCartCount);

    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, []);

  // Load cart items whenever cart is opened or items are modified
  useEffect(() => {
    if (!isCartOpen) {
      updateCartCount();
    }
  }, [isCartOpen]);

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  return (
    <>
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
            <button
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
                {cartItemCount > 0 && (
                  <span className="badge badge-sm indicator-item bg-red-600 text-white">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sliding Cart */}
      <SlidingCart
        isOpen = {isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
};

export default Header2;
