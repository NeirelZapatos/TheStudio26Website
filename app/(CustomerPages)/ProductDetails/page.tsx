import React from "react";

export default function Page() {
  return (
    <>
      {/* Gray area around Studio 26 title */}
      <section className="bg-gray-800 text-white text-center py-5">
        <h1 className="text-4xl font-bold text-red-600">The Studio 26</h1>
        <p className="text-lg text-gray-400">
          4100 Cameron Park Drive #118, Cameron Park, CA 95682
        </p>
      </section>

      {/* Product Section */}
      <section className="bg-gray-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Back Button with more transparency */}
          <button className="bg-blue-500 bg-opacity-80 text-white py-2 px-4 rounded-full transition duration-300 hover:bg-opacity-100 hover:bg-blue-600 mb-4">
            ⬅️ Back
          </button>

          {/* Product Title with Price Tag */}
          <div className="flex justify-center items-center mb-4 relative">
            {/* Title */}
            <h2 className="text-3xl font-bold mr-4">Product Name</h2>

            {/* Paper-style Price Tag */}
            <div className="relative flex items-center">
              <div className="bg-yellow-300 text-green-600 py-2 px-6 rounded-lg shadow-lg font-bold text-lg relative">
                {/* The price */}
                $49.99
                {/* "Thread Hole" Circle */}
                <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 rounded-full border-2 border-gray-200"></div>
              </div>

              {/* Optional tag thread (just for decoration) */}
              <div className="absolute left-0 top-1/2 transform -translate-x-full -translate-y-1/2 w-4 h-4 border-t-2 border-l-2 border-gray-600 rounded-tl-lg"></div>
            </div>
          </div>

          {/* Product Image */}
          {/* <img 
        src="path_to_your_product_image.jpg" 
        alt="Product" 
        className="w-1/2 h-auto mb-4 rounded-lg shadow-lg"
      /> */}

          {/* Add to Shopping Cart Button */}
          <button className="bg-blue-500 text-white py-2 px-4 rounded-full transition duration-300 hover:bg-blue-600">
            Add to Shopping Cart
          </button>

          {/* Product Description */}
          <p className="mt-4 text-lg">
            This is a brief description of the product. It highlights the key
            features and benefits that potential customers might find useful.
          </p>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-gray-800 text-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Latest Reviews</h2>
          <div className="flex justify-center space-x-4">
            {/* Review Box 1 */}
            <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg shadow hover:shadow-lg transition duration-300 w-1/3">
              <p className="text-lg">
                "Amazing experience! The staff was so friendly."
              </p>
              <div className="flex justify-center my-2">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="font-semibold">- Jane Doe</p>
            </div>

            {/* Review Box 2 */}
            <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg shadow hover:shadow-lg transition duration-300 w-1/3">
              <p className="text-lg">
                "I loved the variety of classes offered."
              </p>
              <div className="flex justify-center my-2">
                <span className="text-yellow-400">⭐⭐⭐⭐</span>
              </div>
              <p className="font-semibold">- John Smith</p>
            </div>

            {/* Review Box 3 */}
            <div className="p-4 bg-gray-700 border border-gray-600 rounded-lg shadow hover:shadow-lg transition duration-300 w-1/3">
              <p className="text-lg">
                "A fantastic place to grow your skills!"
              </p>
              <div className="flex justify-center my-2">
                <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
              </div>
              <p className="font-semibold">- Emily Johnson</p>
            </div>
          </div>

          {/* Icon to leave a review */}
          <div className="mt-8">
            <span className="text-2xl text-blue-400 cursor-pointer hover:text-blue-600 transition duration-300">
              📝 Leave a Review
            </span>
          </div>
        </div>
      </section>

      <section className="bg-gray-800 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <form className="flex flex-col items-center mt-4">
            {/* Center the text and adjust it slightly to the left with a margin */}
            <p className="text-lg bg-black inline-block p-2 rounded-t-lg mb-0 w-80 text-center ml-[-3rem]">
              Subscribe to our mailing list
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="p-3 w-80 border border-gray-300 rounded-l-lg focus:outline-none bg-white text-black"
              />
              <button
                type="submit"
                className="bg-transparent border-2 border-transparent text-white px-4 py-3 rounded-r-lg hover:bg-red-500 transition duration-300"
              >
                →
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
