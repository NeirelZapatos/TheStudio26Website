'use client';


import { useState } from 'react';
import axios from 'axios';


type Product = {
  id: string;
  name: string;
  description: string;
  productType: string;
  purchaseType: string;
  recurring: boolean;
  price: number;
};


export default function Page() {
 const [products, setProducts] = useState<Product[]>([]);
 const [message, setMessage] = useState<string>('');

 // Product form fields
 const [name, setName] = useState<string>('');
 const [description, setDescription] = useState<string>('');
 const [productType, setProductType] = useState<string>('');
 const [purchaseType, setPurchaseType] = useState<string>(''); // "Class" or "Item"
 const [recurring, setRecurring] = useState<boolean>(false); // true for Recurring, false for One-Time
 const [price, setPrice] = useState<number>(0); // Default to 0


 // Fetch all Stripe products
 const listStripeProducts = async () => {
   try {
     const response = await axios.get('/api/stripe/list-products');
     setProducts(response.data);
     setMessage('Products retrieved successfully');
   } catch (error) {
     setMessage('Error listing products');
     console.error(error);
   }
 };


// Create a product in Stripe
const createStripeProduct = async (e: React.FormEvent) => {
  e.preventDefault(); // Prevent the default form submission behavior
  try {
    const response = await axios.post('/api/stripe/create-product', {
      name,
      description,
      productType,
      purchaseType,
      recurring,
      price,
    });
    setMessage('Product Created: ' + response.data.name);
    // Clear form fields
    setName('');
    setDescription('');
    setProductType('');
    setPurchaseType('');
    setRecurring(false);
    setPrice(0);
    listStripeProducts(); // Refresh the product list after creation
  } catch (error) {
    setMessage('Error creating product');
    console.error(error);
  }
};


   // Delete a product
   const deleteStripeProduct = async (id: string) => {

    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) {
      return; // Exit if the user cancels the deletion
    }

    try {
      await axios.delete('/api/stripe/delete-product', {
        data: { id }, // Send the product ID in the request body
      });
      setMessage('Product deleted successfully');
      listStripeProducts(); // Refresh the product list after deletion
    } catch (error) {
      setMessage('Error deleting product');
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Test Stripe and Shippo APIs</h1>

      {/* Form for product details */}
      <form onSubmit={createStripeProduct}>
        <div>
          <label>Product Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Product Type:</label>
          <input
            type="text"
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Class or Item:</label>
          <select
            value={purchaseType}
            onChange={(e) => setPurchaseType(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="Class">Class</option>
            <option value="Item">Item</option>
          </select>
        </div>
        <div>
          <label>Recurring / One-Time Purchase:</label>
          <select
            value={recurring ? 'Recurring' : 'One-Time'}
            onChange={(e) => setRecurring(e.target.value === 'Recurring')}
            required
          >
            <option value="One-Time">One-Time</option>
            <option value="Recurring">Recurring</option>
          </select>
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            min="0"
          />
        </div>
        <button type="submit">Create Stripe Product</button>
      </form>

      <button onClick={listStripeProducts}>List Stripe Products</button>

      {message && <p>{message}</p>}

      {products.length > 0 && (
        <div>
          <h2>Product List</h2>
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <strong>{product.name}</strong>: {product.description || 'No description available'}
                <button onClick={() => deleteStripeProduct(product.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
