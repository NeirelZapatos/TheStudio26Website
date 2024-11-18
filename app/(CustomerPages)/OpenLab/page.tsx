"use client";
import Header1 from "../Components/Header1";
import Footer1 from "../Components/Footer1";
import Header2 from "../Components/Header2";
import Footer2 from "../Components/Footer2";
import React from "react";
import Image from "next/image";

export default function Page() {
  return (
    <div>

      {/* Lab Sessions */}
      <div className="bg-[#f5f5f5] bg">
        <section className="text-center p-10 bg-white-100">
          <h2 className="text-4xl font-bold text-[#1e1e1e] mb-4 mx-auto">
            Lab Sessions
          </h2>
          <p className="text-xl font-bold text-[#000000] max-w-3xl mx-auto">
            Open Lab with Master Dan
          </p>
        </section>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-6">
        <button className="px-4 py-2 bg-black text-white rounded-l-lg">
          Individual
        </button>
        <button className="px-4 py-2 bg-gray-200 rounded-r-lg">Monthly</button>
      </div>

      {/* Cards */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          <Card
            title="Bench Time - Sundays"
            imageUrl="https://picsum.photos/200/300"
            price={40}
          />
          <Card
            title="Bench Time - Mondays"
            imageUrl="https://picsum.photos/200/300"
            price={40}
          />
          <Card
            title="Bench Time - Thursdays"
            imageUrl="https://picsum.photos/200/300"
            price={40}
          />
        </div>
      </div>

      {/* Mailing List */}
      <section className="bg-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-lg">Subscribe to our mailing list</p>
          <form className="flex justify-center mt-4">
            <input
              type="email"
              placeholder="Email"
              className="p-3 w-64 border border-gray-300 rounded-l-lg focus:outline-none bg-white text-black"
            />
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-3 rounded-r-lg hover:bg-gray-700"
            >
              →
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

const Card: React.FC<{ title: string; imageUrl: string; price: number }> = ({
  title,
  imageUrl,
  price,
}) => (
  <div className="border border-gray-300 rounded-lg overflow-hidden w-60 p-4 mx-auto my-auto">
    {/* Image Container */}
    <div className="w-full h-60 bg-gray-100 flex items-center justify-center">
      <img
        src={imageUrl}
        width={300}
        height={300}
        alt={title}
        className="w-full h-full object-cover object-center"
      />
    </div>
    {/* Card Content */}
    <div className="p-1 text-left">
      <h3 className="text-lg text-gray-600">{title}</h3>
      <p className="text-black mt-2 font-bold">${price}</p>
    </div>
  </div>
);