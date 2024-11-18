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
        <button className="px-4 py-2 bg-gray-200 rounded-l-lg">Individual</button>
        <button className="px-4 py-2  bg-black text-white rounded-r-lg">Monthly</button>
      </div>

      <section className="container mx-auto px-4 py-8 flex justify-center">
        <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 w-full md:w-1/2">
          <h3 className="text-2xl font-bold text-center mb-4">Silver Lab Bundle</h3>
          <div className="text-center">
            <p className="text-5xl font-bold mb-2">$100<span className="text-lg">/mo</span></p>
          </div>
          <p className="text-center text-gray-400 mb-4">
            Studio 26 access, 6 benches, tools, 4-hour sessions, alumni only. <br />
            BYO materials, torch & butane.
          </p>
          <ul className="list-disc list-inside mb-6 space-y-2">
            <li>Membership savings: $15 for a 3-session bundle at $100</li>
            <li>Use of open studio 26 jewelry bench</li>
            <li>Optional use of provided torch and butane for a small fee</li>
            <li>Work alongside Master Dan, other jewelers, and students</li>
            <li>4-hour bench time sessions</li>
            <li>6 available benches per session</li>
            <li>Assistance with learned techniques</li>
            <li>Independence in skill development</li>
          </ul>
          <div className="flex justify-center">
            <button className="bg-white text-gray-900 px-6 py-2 rounded-md font-bold hover:bg-gray-200">
              Select
            </button>
          </div>
        </div>
      </section>

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