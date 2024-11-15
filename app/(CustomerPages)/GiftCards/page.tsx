import Head from 'next/head';

const GiftCardPage = () => (
  <>
    <Head>
      <title>Gift Cards - The Studio 26</title>
      <meta name="description" content="Purchase gift cards for The Studio 26 jewelry-making classes and more." />
    </Head>

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
  </>
);

export default GiftCardPage;