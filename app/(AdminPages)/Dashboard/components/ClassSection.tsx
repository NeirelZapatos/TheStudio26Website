"use client";

import { useState } from "react";
import axios from "axios";
import { courseTemplates } from "@/utils/productTemplates";

type Product = {
  id: string;
  name: string;
  description: string;
  productType: string;
  purchaseType: "Item" | "Course";
  recurring: boolean;
  price: number;
};

export default function Page() {
  const [message, setMessage] = useState<string>("");

  // Template search
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const filteredTemplateList = courseTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Helper functions to format current date and time (optional)
  const getCurrentDate = () => new Date().toISOString().split("T")[0];
  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  // Product form fields
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [itemType, setItemType] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [recurring, setRecurring] = useState<boolean>(false);
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [instructor, setInstructor] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [location, setLocation] = useState<string>(
    "4100 Cameron Park Drive, Suite 118 Cameron Park, CA 95682"
  );

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const convertedPrice = price ? Math.round(parseFloat(price) * 100) : 0;
    const convertedDuration = duration ? parseInt(duration) : undefined;

    try {
      const stripeResponse = await axios.post("/api/stripe/create-product", {
        name,
        description,
        itemType,
        purchaseType: "Course",
        recurring,
        price: convertedPrice,
        duration: convertedDuration,
      });
      const createdProduct = stripeResponse.data;
      console.log("Stripe API Response:", createdProduct);

      const productData: any = {
        id: createdProduct.product.id,
        name,
        description,
        itemType,
        purchaseType: "Course",
        recurring,
        price: convertedPrice,
        stripeProductId: createdProduct.product.id,
        date,
        time,
        instructor,
        duration: convertedDuration,
        location,
      };

      await axios.post("/api/courses", productData);
      setMessage("Product saved to MongoDB");

      // Reset form fields
      setName("");
      setDescription("");
      setItemType("");
      setRecurring(false);
      setPrice("");
      setDate("");
      setTime("");
      setInstructor("");
      setDuration("");
      setLocation("4100 Cameron Park Drive, Suite 118 Cameron Park, CA 95682");
    } catch (error) {
      setMessage("Error creating product");
      console.error("Error in create Product", error);
    }
  };

  const loadTemplate = (index: string) => {
    if (index !== "") {
      const template = courseTemplates[parseInt(index)];
      setName(template.name);
      setDescription(template.description);
      setRecurring(template.recurring);
      setPrice(template.price);
      setInstructor(template.instructor);
      setDuration(template.duration);
      setLocation(template.location);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-6 text-center">Create a Class</h2>

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
          <form onSubmit={createClass} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="label font-semibold">Product Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="label font-semibold">Description</label>
                <textarea
                  value={description}
                  rows={6}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ overflowWrap: "break-word", whiteSpace: "pre-wrap" }}
                  className="textarea textarea-bordered textarea-sm w-full"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="label font-semibold">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* Recurring / One Time */}
              <div>
                <label className="label font-semibold">Recurring / One-Time</label>
                <select
                  value={recurring ? "Recurring" : "One-Time"}
                  onChange={(e) => setRecurring(e.target.value === "Recurring")}
                  className="select select-bordered select-sm w-full"
                  required
                >
                  <option value="One-Time">One-Time</option>
                  <option value="Recurring">Recurring</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="flex space-x-4">
                <div className="w-full">
                  <label className="label font-semibold">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>
                <div className="w-full">
                  <label className="label font-semibold">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input input-bordered input-sm w-full"
                    required
                  />
                </div>
              </div>

              {/* Instructor */}
              <div>
                <label className="label font-semibold">Instructor</label>
                <select
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="select select-bordered select-sm w-full"
                  required
                >
                  <option value="">Select an Instructor</option>
                  <option value="Instructor 1">Instructor 1</option>
                  <option value="Instructor 2">Instructor 2</option>
                  <option value="Instructor 3">Instructor 3</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="label font-semibold">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  min={0}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setDuration(val);
                    }
                  }}
                  className="input input-bordered input-sm w-full"
                />
              </div>

              {/* Price */}
              <div>
                <label className="label font-semibold">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setPrice(val);
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="Price"
                  step="0.01"
                  style={{ appearance: "none" }}
                  className="input input-bordered input-sm w-full"
                  required
                  min="0"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="col-span-1 md:col-span-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
              >
                Add Class
              </button>
            </div>
          </form>

          {message && (
            <p className="text-center text-lg font-semibold mt-4">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}