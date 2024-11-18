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

      {/* Individual Client Info */}
      <section className="container mx-auto px-4 py-8 flex flex-col md:flex-row justify-center gap-6">
        {/* Client Details Form */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Client Details</h3>
          <form className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-1/2 p-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-1/2 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="number"
              placeholder="Number of Participants"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <textarea
              placeholder="Add Your Message..."
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
            />
          </form>
        </div>

        {/* Booking Details */}
        <div className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/2 relative">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Details</h3>
          <div className="text-left space-y-2">
            <p><strong>Bench Time - Sundays</strong></p>
            <p>September 29, 2024 @ 9:30 AM</p>
            <p>400 Cameron Park Drive</p>
            <p>Dan</p>
            <p>4 hr</p>
            <p>4 Hours</p>
          </div>
          <hr className="my-4" />
          <div>
            <h4 className="text-lg font-bold mb-2">Payment Details</h4>
            <p>Silver Lab Bundle</p>
          </div>
        </div>
      </section>

      {/* Checkout Button */}
      <div className="flex justify-end">
        <button className="bg-gray-800 text-white px-10 py-2 rounded-md hover:bg-gray-900">Checkout</button>
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