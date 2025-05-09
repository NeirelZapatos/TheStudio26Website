"use client";

import { addToCart } from "@/services/cartService";
import { useState, useEffect } from "react";
import { ShoppingCart, CheckCircle } from "lucide-react";

interface AddToCartButtonProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image_url: string;
    quantity_in_stock?: number;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [showAlert, setShowAlert] = useState(false);

  // Clean up any lingering alerts when component unmounts
  useEffect(() => {
    return () => {
      if (showAlert) {
        setShowAlert(false);
      }
    };
  }, []);

  const handleAddToCart = () => {
    const item = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    };

    addToCart(item);
    setShowAlert(true);

    // Hide alert after 5 seconds
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  return (
    <>
      {/* Alert notification */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-11/12 max-w-6xl z-50 animate-slideDown">
          <div className="alert alert-success flex items-center bg-green-100 border-l-4 border-green-500 p-4 rounded shadow-md">
            <CheckCircle className="text-green-500 mr-3" size={20} />
            <div className="flex-1">
              <span className="font-medium text-green-800">Success!</span>
              <p className="text-green-700">
                {product.name} has been added to your cart.
              </p>
            </div>
            <button
              className="text-green-500 hover:text-green-700"
              onClick={(e) => {
                e.preventDefault();
                setShowAlert(false);
              }}
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
        </div>
      )}

      {/* Add to cart button */}
      <div className="hidden md:block absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={(e) => {
            e.preventDefault(); // prevents navigation when button is clicked
            handleAddToCart();
          }}
          className="bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-md hover:bg-blue-500 hover:text-black transition-colors duration-200"
        >
          <ShoppingCart size={20} />
        </button>
      </div>
    </>
  );
}
