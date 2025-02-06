// 'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Page() {
  const [message, setMessage] = useState<string>('');

  // Product form fields
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [itemType, setItemType] = useState<string>(''); // Ring, Necklace, etc...
  const [price, setPrice] = useState<number>(); // Default to 0
  const [quantityInStock, setQuantityInStock] = useState<number>(0);

  const createItem = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating Item");

    const priceInCents = Math.round((price || 0) * 100);

    try {
      // Define base product data with common fields
      const productData: any = {
        name,
        description,
        itemType,
        purchaseType: 'Item',
        price: priceInCents,
        quantityInStock,
      };

      await axios.post('/api/items', productData);
      setMessage('Product saved to MongoDB');

      // Clear form fields
      setName('');
      setDescription('');
      setItemType('');
      setPrice(undefined);
      setQuantityInStock(0); // Clear quantityInStock for future entries
    } catch (error) {
      setMessage('Error creating product');
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Create an Item</h2>
      <form onSubmit={createItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Product Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered input-sm"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              value={description}
              rows={6}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered textarea-sm"
              required
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="form-control">
            <label className="label">Item Type</label>
            <input
              type="text"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="input input-bordered input-sm"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">Amount in Stock</label>
            <input
              type="number"
              value={quantityInStock}
              onChange={(e) => setQuantityInStock(parseInt(e.target.value))}
              className="input input-bordered input-sm"
              required
              min="0"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full col-span-1 md:col-span-2">
          Save to Database
        </button>
      </form>
      {message && <p className="text-center text-green-600 mt-4">{message}</p>}
    </div>
  );
};
