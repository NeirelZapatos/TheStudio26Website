"use client";

import Head from 'next/head';
import { useState } from 'react';

const GiftCardPage = () => {
  const [amount, setAmount] = useState<number>(50);
  const [quantity, setQuantity] = useState<number>(1);
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const predefinedAmounts = [50, 75, 100, 150, 200];
  const quantities = [1, 2, 3, 4, 5];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ amount, quantity, recipientEmail, recipientName, deliveryDate, message });
  };

  return (
    <>
      <Head>
        <title>Gift Cards - The Studio 26</title>
        <meta name="description" content="Purchase gift cards for The Studio 26 jewelry-making classes and more." />
      </Head>
      <main className="my-8">
        <div className="flex justify-center">
          <div className="card w-full max-w-3xl shadow-md p-4 flex gap-8 flex-row-reverse">
            <div className="w-1/2">
              <h2 className="text-2xl font-bold">The Studio 26 eGift Card</h2>
              <p className="text-xl font-bold">${amount}</p>
              <p className="mb-4 text-sm">Classes at The Studio 26 school include use of tools, with each student having their own bench to use during class, learn how to use traditional hand tools to make jewelry!</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm">Amount</label>
                  <select className="w-full p-2 border overflow-auto" value={amount} onChange={(e) => setAmount(Number(e.target.value))}>
                    {predefinedAmounts.map((amt) => (
                      <option key={amt} value={amt}>${amt}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm">Quantity</label>
                  <select className="w-full p-2 border" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                    {quantities.map((qty) => (
                      <option key={qty} value={qty}>{qty}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm">Recipient Email</label>
                  <input type="email" className="w-full p-2 border" placeholder="Recipient Email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm">Recipient Name</label>
                  <input type="text" className="w-full p-2 border" placeholder="Recipient Name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm">Delivery Date</label>
                  <input type="date" className="w-full p-2 border" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="block text-sm">Message</label>
                  <textarea className="w-full p-2 border" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <button type="submit" className="w-full p-2 bg-black text-white">Buy Now</button>
              </form>
            </div>
            <div className="w-1/2">
              <img src="/images/gift-card.jpg" alt="Gift Card" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default GiftCardPage;