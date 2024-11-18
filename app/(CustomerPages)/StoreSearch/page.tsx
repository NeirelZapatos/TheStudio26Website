import React from "react";
import ProductCard from "./Components/ProductCard";
import Sidebar from "./Components/Sidebar";

export default function StorePage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* Search bar and sort by ascending/descending */}
        <div className="flex justify-between items-center mb-4">
          <div className="form-control w-full max-w-xs">
            <input
              type="text"
              placeholder="Search"
              className="input input-bordered w-full max-w-xs"
            />
          </div>
          <div className="flex space-x-2">
            <button className="btn btn-outline">New</button>
            <button className="btn btn-outline">Price ascending</button>
            <button className="btn btn-outline">Price descending</button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-4">
        <div className="join">
        <button className="join-item btn">«</button>
          <button className="join-item btn btn-active">1</button>
          <button className="join-item btn">2</button>
          <button className="join-item btn">3</button>
          <button className="join-item btn">4</button>
          <button className="join-item btn">»</button>
        </div>
        </div>
      </main>
    </div>
  );
}
