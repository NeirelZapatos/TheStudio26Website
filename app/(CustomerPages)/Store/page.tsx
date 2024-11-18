import React from 'react';

export default function Page() {
    return (
      <>
      <h1 className="text-center text-4xl font-bold text-red-600">The Studio 26</h1>
      <p className="text-center text-lg text-gray-400">4100 Cameron Park Drive #118, Cameron Park, CA 95682</p>
      <div>
        <nav className="flex justify-center space-x-6 mp-4">
          <div className="relative group">
            <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Stones</a>
            <div className="absolute hidden group-hover:block bg-white border rounded shadow-lg mt-1 z-50">
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">All Stones</a>
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Handpicked by Debora</a>
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Cabochons</a>
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Faceted Stones</a>
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Slabs</a>
            </div>
          </div>

          <div className="relative group">
            <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Jewelry</a>
            <div className="absolute hidden group-hover:block bg-white border rounded shadow-lg mt-1 z-50">
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">All Jewelry</a>
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Handcrafted by Master Dan</a>
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Handcrafted by Ruben</a>
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Casted Jewelry</a>
            </div>
          </div>

          <div className="relative group">
            <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Supplies</a>
            <div className="absolute hidden group-hover:block bg-white border rounded shadow-lg mt-1 z-50">
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">All Supplies</a>
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Silver</a>
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Kits</a>
              <a href="#" className="block px-4 py-2 text-black hover:bg-gray-100">Tools</a>
            </div>
          </div>
        </nav>
      </div>
      
        <section className="relative bg-cover bg-center text-center py-20">
        <div className="max-w-2xl mx-auto bg-white bg-opacity-75 p-8">
          <h2 className="text-2xl font-bold uppercase mb-4">Welcome to the Studio 26, LLC</h2>
          <p className="text-lg text-gray-600 mb-8">
            Indulge in the charm of our online jewelry store, which offers a convenient 
            and accessible way to explore and acquire exquisite handmade jewelry, stones, and 
            supplies, all from the comfort of your own home.
          </p>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Shop All
          </button>
        </div>
      </section>

      
      <section className="py-12">
        <h1 className="text-center font-bold text-4xl">Collections</h1>
        <div className="max-w-7xl mx-auto grid frid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <a href="#" className="block text-xl font-bold mt-4 text-black hover:text-pretty hover:underline">Stones</a>
          </div>
          <div className="text-center">
          <a href="#" className="block text-xl font-bold mt-4 text-black hover:text-pretty hover:underline">Jewelry</a>
          </div>
          <div className="text-center">
          <a href="#" className="block text-xl font-bold mt-4 text-black hover:text-pretty hover:underline">Supplies</a>
          </div>
        </div>
      </section>
      </>
    );
  }