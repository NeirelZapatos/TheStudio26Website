"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCart } from "@/services/cartService";
import SlidingCart from "@/app/Components/SlidingCart";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Instagram, Facebook } from "@mui/icons-material";

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const updateCartCount = () => {
    const items = getCart();
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    setCartItemCount(totalQuantity);
  };

  useEffect(() => {
    updateCartCount();

    window.addEventListener("cart-updated", updateCartCount);

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("scroll", handleScroll);
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

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
  };

  const mainNavLinks = [
    { href: "/StoreSearch", label: "Online Store" },
    { href: "/class-catalog", label: "Class Catalog" },
    { href: "/calendar", label: "Calendar" },
    { href: "/OpenLab", label: "Open Lab" },
    { href: "/GiftCards", label: "Gift Cards" },
    { href: "/Contact", label: "Contact" },
  ];

  // Split links for left and right sides of the logo
  const leftNavLinks = mainNavLinks.slice(0, 3);
  const rightNavLinks = mainNavLinks.slice(3);

  return (
    <>
      {/* Top bar */}
      <div className="bg-black text-white py-2 px-2 hidden sm:block">
        <div className="container mx-auto flex justify-between items-center">
          {/* Left side of top bar */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/thestudio26"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-amber-300 transition-colors"
            >
              <Facebook />
            </a>
            <a
              href="https://www.instagram.com/thestudio26/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-amber-300 transition-colors"
            >
              <Instagram />
            </a>
            <p className="text-white font-bold text-sm hidden sm:block">
              Tel: (916) 350-0546
            </p>
            <p className="text-white font-bold text-xl hidden sm:block"> | </p>
            <Link href="OpenLab">
              <p className="text-white font-bold text-sm hover:text-amber-300 transition-all duration-300 hidden sm:block">
                Become A Member
              </p>
            </Link>
          </div>

          {/* Right side of top bar */}
          <div className="flex items-center gap-4">
            <p className="text-white font-bold text-sm hidden sm:block">
              Classes By Appointment Only
            </p>
            <p className="text-white font-bold text-xl hidden sm:block"> | </p>
            <button
              onClick={toggleCart}
              className="text-white hover:text-amber-300 transition-colors relative"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div
        className={`sticky top-0 z-50 bg-white shadow-md transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={toggleDrawer} className="btn btn-ghost">
              <Menu size={24} />
            </button>
          </div>

          {/* Left side of logo on navbar */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-9 ml-4">
            {leftNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-extralight text-black hover:text-red-500 transition-all duration-300 py-2 group text-sm lg:text-base"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Logo */}
          <div className="flex justify-center mx-auto">
            <Link
              href="/"
              className={`md:mr-4 lg:mr-8 font-special-gothic font-bold text-red-700 transition-all duration-300 text-center ${
                scrolled
                  ? "text-lg md:text-xl lg:text-2xl"
                  : "text-xl md:text-2xl lg:text-3xl"
              }`}
            >
              THE STUDIO 26
            </Link>
          </div>

          {/* Right side of logo on navbar */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-9 mr-4 lg:mr-8">
            {rightNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-extralight text-black hover:text-red-500 transition-all py-2 group text-sm lg:text-base"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Mobile cart button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={toggleCart}
              className="text-black hover:text-red-500 transition-colors relative"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Placeholder for mobile to balance the layout */}
          <div className="md:hidden w-6"></div>
        </div>
      </div>

      {/* Mobile drawer - Updated to right side with daisyUI */}
      <div className="drawer drawer-end z-50 md:hidden">
        <input
          id="drawer"
          type="checkbox"
          className="drawer-toggle"
          checked={isDrawerOpen}
          onChange={toggleDrawer}
        />

        <div className="drawer-side">
          <label htmlFor="drawer" className="drawer-overlay"></label>
          <div className="menu p-4 w-full sm:w-80 min-h-full bg-white text-gray-800">
            {/* Close button */}
            <div className="flex justify-between items-center mb-6">
              <Link
                href="/"
                className="font-special-gothic font-bold text-red-700 text-xl"
              >
                THE STUDIO 26
              </Link>
              <button
                onClick={toggleDrawer}
                className="btn btn-ghost btn-circle"
              >
                <X size={24} />
              </button>
            </div>

            <div className="divider"></div>

            <ul className="space-y-4">
              {mainNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block py-2 px-4 hover:bg-gray-100 hover:text-red-500 transition-colors rounded-lg"
                    onClick={toggleDrawer}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Additional info section */}
            <div className="divider my-6"></div>

            <div className="space-y-4 text-sm text-gray-600">
              {/* Address */}
              <address className="not-italic">
                {" "}
                <p className="font-medium">The Studio 26</p>
                <p>4100 Cameron Park Drive, Suite 118</p>
                <p>Cameron Park, CA 95682</p>
              </address>

              {/* Contact */}
              <div className="space-y-1">
                <p className="font-bold">
                  <span className="font-bold text-gray-500">Tel:</span> (916)
                  350-0546
                </p>
                <p className="font-bold">
                  <span className="font-bold text-gray-500">Email:</span>{" "}
                  thestudio26@gmail.com
                </p>
              </div>

              {/* Business Hours */}
              <div className="space-y-1">
                <p className="font-bold">Hours:</p>
                <p>Mon - Fri: 9:30am - 2:30pm</p>
                <p>Sat - Sun: 9:30am - 2:30pm</p>
              </div>

              {/* Notice */}
              <p className="italic text-gray-500">
                Classes By Appointment Only
              </p>

              {/* Social Links */}
              <div className="flex gap-4 pt-2">
                <a
                  href="https://www.facebook.com/thestudio26"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Facebook />
                </a>
                <a
                  href="https://www.instagram.com/thestudio26/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-600 hover:text-red-500 transition-colors"
                >
                  <Instagram />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Cart */}
      <SlidingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
