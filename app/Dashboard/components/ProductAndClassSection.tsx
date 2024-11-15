// 'use client';

import { useState } from 'react';
import axios from 'axios';

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
  // ! Helper function to format current date and time
  const getCurrentDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string>('');

  // Product form fields
  const [purchaseType, setPurchaseType] = useState<string>(''); // "Class" or "Item"
  /* --------------- Common Fields ---------------*/
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [itemType, setItemType] = useState<string>(''); // Ring, Necklace, etc...
  const [price, setPrice] = useState<number>(); // Default to 0
  /* --------------- Product Fields ---------------*/
  const [quantityInStock, setQuantityInStock] = useState<number>(0);
  /* --------------- Course Fields ---------------*/
  const [recurring, setRecurring] = useState<boolean>(false); // true for Recurring, false for One-Time
  const [date, setDate] = useState<string>(getCurrentDate);
  const [time, setTime] = useState<string>(getCurrentTime);
  const [instructor, setInstructor] = useState<string>('');
  const [duration, setDuration] = useState<number | undefined>();
  const [location, setLocation] = useState<string>('4100 Cameron Park Drive, Suite 118 Cameron Park, CA 95682');

  // Fetch all Stripe products
  const listStripeProducts = async () => {
    try {
      const response = await axios.get('/api/stripe/list-products', {
        params: { active: true },
      });

      const productsWithMetadata = response.data.map((product: any) => {
        // ! Debug Logging
        console.log(`Product ID: ${product.id}, Metadata:`, product.metadata);
        return {
          ...product,
          purchaseType: product.metadata.purchaseType, // Access purchaseType from metadata
        };
      });

      setProducts(productsWithMetadata);
      setMessage('Products retrieved successfully');
    } catch (error) {
      setMessage('Error listing products');
      console.error(error);
    }
  };

  // Create a product in Stripe
  const createStripeProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating product with purchaseType:", purchaseType);

    const priceInCents = Math.round((price || 0) * 100);

    try {
      const stripeResponse = await axios.post('/api/stripe/create-product', {
        name,
        description,
        itemType,
        purchaseType,
        recurring,
        price: priceInCents,
        metadata: {
          purchaseType,
        }
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
        purchaseType,
        recurring,
        price: priceInCents,
        stripeProductId: createdProduct.product.id,
      }; // Debug log

      // Conditionally add item-specific fields if purchaseType is "Item"
      if (purchaseType === "Item") {
        productData.quantity_in_stock = quantityInStock; // Add quantityInStock for items only
      }

      // Conditionally add course-specific fields if purchaseType is "Course"
      if (purchaseType === "Course") {
        productData.date = date;
        productData.time = time;
        productData.instructor = instructor;
        productData.duration = duration;
        productData.location = location;
      }

      console.log("Payload sent to API:", productData);

      // Choose the appropriate endpoint based on purchaseType
      const endpoint = purchaseType === "Course" ? '/api/courses' : '/api/items';

      // Save to MongoDB
      const mongoResponse = await axios.post(endpoint, productData);
      setMessage('Product created in Stripe and saved to MongoDB');

      // Clear form fields
      setName('');
      setDescription('');
      setItemType('');
      setPurchaseType('');
      setRecurring(false);
      setPrice(undefined);
      setQuantityInStock(0); // Clear quantityInStock for future entries
      setDate(getCurrentDate);
      setTime(getCurrentTime);
      setInstructor('');
      setDuration(undefined);
      listStripeProducts(); // Refresh the product list after creation
    } catch (error) {
      setMessage('Error creating product');
      console.error("Error in createStripeProduct", error);
    }
  };

  // Archive Stripe product and delete from courses in MongoDB
  const archiveCourseProduct = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to archive this course product?');
    if (!confirmDelete) return;

    try {
      // Archive from Stripe
      await axios.delete('/api/stripe/archive-product', { data: { id } });

      // Delete from MongoDB courses
      const response = await axios.delete(`/api/courses/${id}`);
      console.log("MongoDB course deletion response:", response.data);

      setMessage('Course product archived from Stripe and deleted from MongoDB');
      listStripeProducts(); // Refresh the product list
    } catch (error) {
      setMessage('Error archiving course product');
      console.error(error);
    }
  };

  // Archive Stripe product and delete from items in MongoDB
  const archiveItemProduct = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to archive this item product?');
    if (!confirmDelete) return;

    try {
      // Archive from Stripe
      await axios.delete('/api/stripe/archive-product', { data: { id } });

      // Delete from MongoDB items
      const response = await axios.delete(`/api/items/${id}`);
      console.log("MongoDB item deletion response:", response.data);

      setMessage('Item product archived from Stripe and deleted from MongoDB');
      listStripeProducts(); // Refresh the product list
    } catch (error) {
      setMessage('Error archiving item product');
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Create an Item or Class</h2>
      <form onSubmit={createStripeProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* --------------- Left Column ---------------*/}
        <div className="space-y-4">
          {/* --------------- Course or Item ---------------*/}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Course or Item</span>
            </label>
            <select
              value={purchaseType}
              onChange={(e) => setPurchaseType(e.target.value)}
              className="select select-bordered select-sm"
              required
            >
              <option value="">Select...</option>
              <option value="Item">Item</option>
              <option value="Course">Course</option>
            </select>
          </div>
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
          {purchaseType === 'Course' && (
            <>
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
            </>
          )}
        </div>
        {/* --------------- Right Column ---------------*/}
        <div className="space-y-4">
          {purchaseType === 'Item' && (
            <>
              {/* --------------- Item Type ---------------*/}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Item Type</span>
                </label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="select select-bordered select-sm"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Necklace">Necklace</option>
                  <option value="Earring">Earring</option>
                  <option value="Ring">Ring</option>
                </select>
              </div>
              {/* --------------- Amount in Stock --------------- */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Amount in Stock</span>
                </label>
                <input
                  type="number"
                  value={quantityInStock} // Adjust to match your state variable
                  onChange={(e) => setQuantityInStock(parseInt(e.target.value))}
                  placeholder="0"
                  className="input input-bordered input-sm w-full"
                  required
                  min="0"
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
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="Price"
                  step="0.01"
                  style={{ appearance: 'none' }}
                  className="input input-bordered input-sm w-full"
                  required
                  min="0"
                />
              </div>
            </>
          )}
          {purchaseType === 'Course' && (
            <>
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
                  step='15'
                  min={0}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
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
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="Price"
                  step="0.01"
                  style={{ appearance: 'none' }}
                  className="input input-bordered input-sm w-full"
                  required
                  min="0"
                />
              </div>
            </>
          )}
        </div>
        {/* --------------- End Right Column ---------------*/}
        {/* --------------- Submit Button ---------------*/}
        <button type="submit" className="btn btn-primary w-full col-span-1 md:col-span-2">
          Create Stripe Product
        </button>
      </form>

      <button onClick={listStripeProducts} className="btn btn-secondary w-full mt-4">List Stripe Products</button>

      {message && <p className="text-center text-green-600 mt-4">{message}</p>}

      {products.map((product) => (
        <li key={product.id} className="p-4 bg-base-200 rounded-lg shadow flex justify-between items-center">
          <strong>{product.name}</strong>{product.description || 'No description available'}
          {product.purchaseType === "Course" ? (
            <button
              onClick={() => archiveCourseProduct(product.id)}
              className="btn btn-error btn-sm"
            >
              Archive Course
            </button>
          ) : product.purchaseType === "Item" ? (
            <button
              onClick={() => archiveItemProduct(product.id)}
              className="btn btn-error btn-sm"
            >
              Archive Item
            </button>
          ) : (
            <span className="text-gray-500">Unknown Type</span>
          )}
        </li>
      ))}

    </div>
  );
};
