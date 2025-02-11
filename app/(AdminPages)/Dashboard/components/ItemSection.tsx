// 'use client';

import { useState } from 'react';
import axios from 'axios';

import { itemTemplates } from '@/utils/productTemplates';
export default function Page() {
  const [message, setMessage] = useState<string>('');

  // Template search
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState('');
  const filteredTemplateList = itemTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Product form fields
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [itemType, setItemType] = useState<string>(''); // Ring, Necklace, etc...
  const [ringSize, setRingSize] = useState<string>(''); // Ring Size
  const [price, setPrice] = useState<string>(""); // Default to 0
  const [quantityInStock, setQuantityInStock] = useState<string>("");

  const ringSizes = [
    "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", 
    "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", 
    "12", "12.5", "13", "13.5", "14", "Other", "N/A"
  ]

  const createItem = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating Item");

    const convertedPrice = price ? Math.round(parseFloat(price) * 100) : 0;

    try {
      // Define base product data with common fields
      const productData: any = {
        name,
        description,
        itemType,
        purchaseType: 'Item',
        price: convertedPrice,
        quantityInStock,
      };

      await axios.post('/api/items', productData);
      setMessage('Product saved to MongoDB');

      // Clear form fields
      setName('');
      setDescription('');
      setItemType('');
      setPrice("");
      setQuantityInStock(""); // Clear quantityInStock for future entries
    } catch (error) {
      setMessage('Error creating product');
      console.error(error);
    }
  };

  const loadTemplate = (index: string) => {
    if (index !== "") {
      const template = itemTemplates[parseInt(index)];
      setName(template.name);
      setDescription(template.description);
      setItemType(template.itemType);
      setPrice(template.price);
    }
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Create an Item</h2>
      {/* ----------------- Template Search ----------------- */}
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-primary btn-sm w-full"
          onClick={() => setShowTemplateSearch(!showTemplateSearch)}
        >
          {showTemplateSearch ? 'Hide Template Search' : 'Search For Template'}
        </button>

        {showTemplateSearch && (
          <div className="mt-2 p-4 boder rounded bh-white shadow">
            <input
              type="text"
              placeholder="Search Templates"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
              }}
              className="input input-bordered input-sm w-full mb-2"
            />

            {filteredTemplateList.length > 0 && searchText.length > 0 ? (
              <ul
                className="border border-gray-200 rounded-md shadow-md overflow-y-auto"
                style={{ maxHeight: filteredTemplateList.length > 4 ? '160px' : 'auto' }} // Scrollable if more than 4 items
              >
                {filteredTemplateList.map((template, index) => (
                  <li key={index}
                    onClick={() => {
                      loadTemplate(index.toString());
                      setShowTemplateSearch(false);
                      setSearchText("");
                    }}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {template.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Nothing to Show</p>
            )}
          </div>
        )}
      </div>

      <form onSubmit={createItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Price</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*\.?\d*$/.test(value)) {
                  setPrice(value);
                }
              }}
              onWheel={(e) => e.preventDefault()}
              placeholder="Price"
              step="0.01"
              style={{ appearance: 'none' }}
              className="input input-bordered input-sm w-full"
              required
              min="0"
            />
          </div>
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
          { itemType === "Jewelry" && (
            <div className="form-control">
            <label className="label">Ring Size</label>
            <select
              value={ringSize}
              onChange={(e) => setRingSize(e.target.value)}
              className="select select-bordered select-sm"
              style={{ maxHeight: '160px', overflowY: 'auto' }}
              required
            >
              <option value="">Select Ring Size</option>
              {ringSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          )}
          <div className="form-control">
            <label className="label">Amount in Stock</label>
            <input
              type="number"
              value={quantityInStock}
              onChange={(e) => setQuantityInStock(e.target.value)}
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
