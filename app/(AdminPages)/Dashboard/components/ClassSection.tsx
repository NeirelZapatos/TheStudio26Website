// 'use client';

import { useState } from 'react';
import axios from 'axios';

import { courseTemplates } from '@/utils/productTemplates';

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
  const [message, setMessage] = useState<string>('');

  // Template search
  const [showTemplateSearch, setShowTemplateSearch] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const filteredTemplateList = courseTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // ! Helper function to format current date and time
  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  // Product form fields
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [itemType, setItemType] = useState<string>(''); // Ring, Necklace, etc...
  const [price, setPrice] = useState<string>(""); // Default to 0
  const [recurring, setRecurring] = useState<boolean>(false); // true for Recurring, false for One-Time
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [instructor, setInstructor] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [location, setLocation] = useState<string>('4100 Cameron Park Drive, Suite 118 Cameron Park, CA 95682');

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();

    const convertedPrice = price ? Math.round(parseFloat(price) * 100) : 0;
    const convertedDuration = duration ? parseInt(duration) : undefined;

    try {
      const stripeResponse = await axios.post('/api/stripe/create-product', {
        name,
        description,
        itemType,
        purchaseType: "Course",
        recurring,
        price: convertedPrice,
        duration: convertedDuration
      });
      const createdProduct = stripeResponse.data;

      // ! Debugging Log
      console.log("Stripe API Response:", createdProduct);

      // Define base product data with common fields
      const productData: any = {
        id: createdProduct.product.id,
        name,
        description,
        itemType,
        purchaseType: 'Course',
        recurring,
        price: convertedPrice,
        stripeProductId: createdProduct.product.id,
        date,
        time,
        instructor,
        duration: convertedDuration,
        location,
      };

      await axios.post('/api/courses', productData);
      setMessage('Product saved to MongoDB');

      // Clear form fields
      setName('');
      setDescription('');
      setItemType('');
      setRecurring(false);
      setPrice("");
      setDate("");
      setTime("");
      setInstructor('');
      setDuration("");
      setLocation('4100 Cameron Park Drive, Suite 118 Cameron Park, CA 95682');
    } catch (error) {
      setMessage('Error creating product');
      console.error("Error in create Product");
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
    <div className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Create a Class</h2>
      {/* --------------- Search For Template ---------------*/}
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-secondary btn-sm w-full"
          onClick={() => setShowTemplateSearch(!showTemplateSearch)}
        >
          {showTemplateSearch ? "Hide Template Search" : "Search For Template"}
        </button>

        {showTemplateSearch && (
          <div className="mt-2 p-4 border rounded bh-white shadow">
            <input
              type="text"
              placeholder="Search Templates"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
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
      <form onSubmit={createClass} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* --------------- Left Column ---------------*/}
        <div className="space-y-4">
          {/* --------------- Name ---------------*/}
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
          {/* --------------- Description ---------------*/}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              value={description}
              rows={6}
              onChange={(e) => setDescription(e.target.value)}
              style={{ overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}
              className="textarea textarea-bordered textarea-sm"
              required
            />
          </div>
          {/* --------------- Location ---------------*/}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Location</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className="input input-bordered input-sm"
              required
            />
          </div>
        </div>
        {/* --------------- Right Column ---------------*/}
        <div className="space-y-4">
          {/* --------------- Recurring / One Time ---------------*/}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Recurring / One-Time Purchase</span>
            </label>
            <select
              value={recurring ? 'Recurring' : 'One-Time'}
              onChange={(e) => setRecurring(e.target.value === 'Recurring')}
              className="select select-bordered select-sm"
              required
            >
              <option value="One-Time">One-Time</option>
              <option value="Recurring">Recurring</option>
            </select>
          </div>
          {/* --------------- Date and Time ---------------*/}
          <div className="form-control">
            <div className="flex space-x-4">
              {/* Date */}
              <div className="w-full">
                <label className="label">
                  <span className="label-text">Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                />
              </div>
              {/* Time */}
              <div className="w-full">
                <label className="label">
                  <span className="label-text">Time</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="input input-bordered input-sm w-full"
                  required
                />
              </div>
            </div>
          </div>
          {/* --------------- Instructor ---------------*/}
          <div className="form-control">
            <label className="label">Instructor</label>
            <select
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="select select-bordered select-sm"
              required
            >
              <option value="">Select an Instructor</option>
              <option value="Instructor 1">Instructor 1</option>
              <option value="Instructor 2">Instructor 2</option>
              <option value="Instructor 3">Instructor 3</option>
              {/* Add more options as needed */}
            </select>
          </div>

          {/* --------------- Duration ---------------*/}
          <div className="form-control">
            <label className="label">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              min={0}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) { // Regex to allow only whole numbers
                  setDuration(value);
                }
              }}
              className="input input-bordered input-sm"
            />
          </div>
          {/* --------------- Price --------------- */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Price</span>
            </label>
            <input
              type="number"
              value={price} // Adjust to match your state variable
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) { // Regex to allow only whole numbers
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
        </div>
        <button type="submit" className="btn btn-primary w-full col-span-1 md:col-span-2">
          Save to Database
        </button>
      </form>
      {message && <p className="text-center text-green-600 mt-4">{message}</p>}
    </div>
  );
};
