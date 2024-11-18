import Head from 'next/head';
import { StrictMode } from 'react';

export default function Page() {
  return (
    <StrictMode>
      <Head>
        <title>The Studio 26</title>
        <meta name="description" content="The Studio 26 - Jewelry making classes and more in Cameron Park, CA" />
      </Head>

      <header className="text-center py-5 bg-white-800 text-black">
        <nav className="flex justify-center space-x-6 mb-4">
          <a href="#" className="text-black hover:underline">Home</a>
          <a href="#" className="text-black hover:underline">Online Store</a>
          <a href="#" className="text-black hover:underline">Class Catalog</a>
          <a href="#" className="text-black hover:underline">Calendar</a>
          <a href="#" className="text-black hover:underline">Open Lab</a>
          <a href="#" className="text-black hover:underline">Gift Cards</a>
          <a href="#" className="text-black hover:underline">Contact Us</a>
          <a href="#" className="text-2xl">🛒</a>
        </nav>
        <h1 className="text-4xl font-bold text-red-600">The Studio 26</h1>
        <p className="text-lg text-gray-400">4100 Cameron Park Drive #118, Cameron Park, CA 95682</p>
      </header>

      <div className="bg-white">
        <section className="text-center p-10 bg-white-100">
          <h2 className="text-3xl font-bold text-yellow-700 mb-4">About Us</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Ever since 2010, The Studio 26 has been providing students with a rich and diverse learning environment. The Studio 26 is located in Cameron Park, CA, and has taught 1000's of students. We encourage students alike to explore, learn and create each passing day.
          </p>
        </section>

        <section className="text-center p-10 bg-white border-t border-gray-300">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Are you interested in learning jewelry making?</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Discover the fundamentals of jewelry crafting, all in one comprehensive beginner class. This is a prerequisite for many of our advanced courses.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            Hurry, Limited Seats Available! Secure your spot today by clicking the button below.
          </p>
          <button className="bg-yellow-700 text-white text-lg py-3 px-8 rounded-lg hover:bg-yellow-600">
            Beginning Jewelry Making Class
          </button>
        </section>
      </div>

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

      <footer className="bg-black text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <p className="mb-4 md:mb-0">TheStudio26@gmail.com</p>
            <p className="mb-4 md:mb-0">
              4100 Cameron Park Drive, Suite 118 <br /> Cameron Park, CA 95682
            </p>
            <p>916-350-0546</p>
          </div>
        </div>
      </footer>
    </StrictMode>
  );
}