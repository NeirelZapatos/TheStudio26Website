"use client";

import { useState } from "react";
import axios from "axios";
import { itemTemplates } from "@/utils/productTemplates";

export default function Page() {
  const [message, setMessage] = useState<string>("");

  // Template Search
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const filteredTemplateList = itemTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Product form fields
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [ringSize, setRingSize] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [quantityInStock, setQuantityInStock] = useState<string>("");

  const ringSizes = [
    "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5",
    "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5",
    "12", "12.5", "13", "13.5", "14", "Other", "N/A",
  ];

  const createItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const convertedPrice = price ? Math.round(parseFloat(price) * 100) : 0;

    try {
      const productData: any = {
        name,
        description,
        itemType,
        purchaseType: "Item",
        price: convertedPrice,
        quantityInStock,
      };

      await axios.post("/api/items", productData);
      setMessage("Product saved to MongoDB");

      // Reset form fields
      setName("");
      setDescription("");
      setItemType("");
      setPrice("");
      setQuantityInStock("");
      setRingSize("");
    } catch (error) {
      setMessage("Error creating product");
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
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Add a New Product
          </h2>

          {/* Template Search Toggle */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setShowTemplateSearch(!showTemplateSearch)}
            >
              {showTemplateSearch ? "Hide Templates" : "Browse Templates"}
            </button>
          </div>

          {/* Template Search Panel */}
          {showTemplateSearch && (
            <div className="mb-6 p-4 border rounded bg-white shadow-sm">
              <input
                type="text"
                placeholder="Search Templates"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input input-bordered input-sm w-full mb-2"
              />

              {filteredTemplateList.length > 0 && searchText.length > 0 ? (
                <ul
                  className="border border-gray-200 rounded-md shadow-md overflow-y-auto"
                  style={{
                    maxHeight: filteredTemplateList.length > 4 ? "160px" : "auto",
                  }}
                >
                  {filteredTemplateList.map((template, index) => (
                    <li
                      key={index}
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
                <p className="text-gray-500 text-sm">No templates found</p>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={createItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Product Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Item Type</span>
                </label>
                <input
                  type="text"
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  placeholder="e.g. Jewelry, Tool, etc."
                  required
                />
              </div>

              {itemType.toLowerCase() === "jewelry" && (
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Ring Size</span>
                  </label>
                  <select
                    value={ringSize}
                    onChange={(e) => setRingSize(e.target.value)}
                    className="select select-bordered select-sm w-full"
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

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Amount in Stock</span>
                </label>
                <input
                  type="number"
                  value={quantityInStock}
                  onChange={(e) => setQuantityInStock(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Price</span>
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*\.?\d*$/.test(val)) {
                      setPrice(val);
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="Price"
                  step="0.01"
                  className="input input-bordered input-sm w-full"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  value={description}
                  rows={5}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea textarea-bordered textarea-sm w-full"
                  required
                />
              </div>
            </div>

            {/* Submit Button (spans both columns) */}
            <div className="col-span-1 md:col-span-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Add to Inventory
              </button>
            </div>
          </form>

          {/* Success / Error Message */}
          {message && (
            <p className="text-center mt-4 text-lg font-semibold">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}