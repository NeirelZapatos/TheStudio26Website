import Head from 'next/head';

const Header = () => (
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
);

const Footer = () => (
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
);

const GiftCardPage = () => (
  <>
    <Head>
      <title>Gift Cards - The Studio 26</title>
      <meta name="description" content="Purchase gift cards for The Studio 26 jewelry-making classes and more." />
    </Head>
    
    <Header />

    <main className="my-8">
      <div className="flex justify-center">
        <div className="card w-full max-w-lg shadow-md p-4">
          
          <h2 className="text-2xl font-bold mb-2">The Studio 26 eGift Card</h2>
          <p className="text-xl font-semibold">$50</p>
          <p className="mb-4">Classes at The Studio 26 include the use of tools, with each student having their own bench to make jewelry.</p>

          <form>
            <div className="mb-4">
              <label className="block">Amount</label>
              <input type="text" className="w-full p-2 border" placeholder="Enter amount" />
            </div>

            <div className="mb-4">
              <label className="block">Recipient Email</label>
              <input type="email" className="w-full p-2 border" placeholder="Recipient Email" />
            </div>

            <div className="mb-4">
              <label className="block">Recipient Name</label>
              <input type="text" className="w-full p-2 border" placeholder="Recipient Name" />
            </div>

            <div className="mb-4">
              <label className="block">Delivery Date</label>
              <input type="date" className="w-full p-2 border" />
            </div>

            <div className="mb-4">
              <label className="block">Message</label>
              <textarea className="w-full p-2 border" placeholder="Message" />
            </div>

            <button type="submit" className="w-full p-2 bg-black text-white">Buy Now</button>
          </form>
        </div>
      </div>
    </main>

    <Footer />
  </>
);

export default GiftCardPage;