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

      {/* Return Button */}
      <div className="container mx-auto px-4 py-4">
        <button className="flex items-center text-gray-700 hover:text-gray-900">
          <span className="mr-2">&larr;</span> Return
        </button>
      </div>

      <section className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-center gap-6">
        {/* Date Picker */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Choose a Date</h3>
          <div className="bg-gray-100 p-4 rounded-md">
            {/* Replace this placeholder with a date picker component */}
            <p className="text-gray-600">[Calendar Component]</p>
          </div>
        </div>

        {/* Time Picker */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Choose a Time</h3>
          <div className="bg-gray-100 p-4 rounded-md">
            {/* Replace this placeholder with time slots */}
            <button className="w-full p-2 mb-2 bg-white border rounded-md hover:bg-black hover:text-white">9:30 AM</button>
            <button className="w-full p-2 mb-2 bg-white border rounded-md hover:bg-black hover:text-white">10:30 AM</button>
            <button className="w-full p-2 mb-2 bg-white border rounded-md hover:bg-black hover:text-white">11:30 AM</button>
          </div>
        </div>
      </section>

      {/* Next Button */}
      <div className="flex justify-end">
        <button className="bg-gray-800 text-white px-10 py-2 rounded-md hover:bg-gray-900">Next</button>
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