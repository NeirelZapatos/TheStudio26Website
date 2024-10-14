'use client';

import { useState } from 'react';
import axios from 'axios';


type Product = {
  id: string;
  name: string;
  description: string;
};

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string>('');

  // Fetch all Stripe products
  const listStripeProducts = async () => {
    try {
      const response = await axios.get('/api/list-products');
      setProducts(response.data);
      setMessage('Products retrieved successfully');
    } catch (error) {
      setMessage('Error listing products');
      console.error(error);
    }
  };

  // Create a product in Stripe
  const createStripeProduct = async () => {
    try {
      const response = await axios.post('/api/create-product', {
        name: 'New Product',       // Customize product data here
        description: 'Description of the new product',
      });
      setMessage('Product Created: ' + response.data.name);
    } catch (error) {
      setMessage('Error creating product');
      console.error(error);
    }
  };

  // Create a shipping label in Shippo
  const createShippoLabel = async () => {
    try {
      const response = await axios.post('/api/create-label');
      setMessage('Label Created: ' + response.data.label_url);
    } catch (error) {
      setMessage('Error creating label');
      console.error(error);
    }
  };

  return (
    <div>
      {/* Buttons to trigger API actions */}
      <ul className="p-4">
        <li><button onClick={createStripeProduct}>Create Stripe Product</button></li>
        <li><button onClick={createShippoLabel}>Create Shippo Label</button></li>
        <li><button onClick={listStripeProducts}>List Stripe Products</button></li>
      </ul>

      {/* Message to show operation status */}
      {message && <p>{message}</p>}
      
      {/* Render list of products */}
      {products.length > 0 && (
        <div>
          <h2>Product List</h2>
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                <strong>{product.name}</strong>: {product.description || 'No description available'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HomePage;
