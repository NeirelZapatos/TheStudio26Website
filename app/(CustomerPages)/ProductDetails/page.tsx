import Link from "next/link";
import React from "react";

export default function ProductPage() {
  return (
    <div className="min-h-screen p-6">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold text-red-600">The Studio 26</h1>
        <p className="text-lg text-gray-400">
          4100 Cameron Park Drive #118, Cameron Park, CA 95682
        </p>
      </header>

      {/* Return to store page link */}
      <div className="mb-6">
        <Link
          href="/StoreSearch"
          className="flex items-center space-x-2 text-gray-600 hover:text-black"
        >
          <span className="material-icons">arrow_back</span>
          <span>Return</span>
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative">
          <img
            src="https://images.freeimages.com/images/large-previews/521/accessories-5-1426954.jpg?fmt=webp&w=500"
            alt="Product"
            className="rounded-lg w-full h-auto"
          />
        </div>

        {/* Product Info */}
        <div>
          <h2 className="text-2xl font-bold mb-2">Product Name</h2>
          <p className="badge badge-success text-sm mb-4">Tag Placeholder</p>
          <p className="text-3xl font-bold mb-4">$50</p>
          <p className="text-gray-600 mb-6">
            The description for the product would go here!
          </p>
          <button className="btn w-full mb-4">Add to Cart</button>
          <div className="collapse collapse-arrow border border-gray-200 rounded-box">
            <input type="checkbox" />
            <div className="collapse-title font-bold">Ring Type</div>
            <div className="collapse-content">
              <p>Another placeholder for the type description!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
