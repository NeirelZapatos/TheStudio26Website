'use client';
import Head from 'next/head';
import Link from 'next/link';

const Header1 = () => {
  return (
  <>
  <Head>
    <title>The Studio 26</title>
    <meta name="description" content="The Studio 26 - Jewelry making classes and more in Cameron Park, CA" />
  </Head>

    <header className="text-center py-5 bg-white-800 text-black">
          <nav className="flex justify-center space-x-6 mb-4">
            <Link href="/HomePage" className="text-black hover:underline">Home</Link>
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
    </>
  );
}

export default Header1;