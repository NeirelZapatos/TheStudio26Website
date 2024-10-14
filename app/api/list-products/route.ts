'use client'; // This is required to mark it as a client-side component

import { useState } from 'react';
import axios from 'axios';

// Type definition for a product
type Product = {
  id: string;
  name: string;
  description: string;
};

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string>('');

  // Function to fetch all Stripe products
  const listStripeProducts = async () => {
    try {
      const response = await axios.get('/api/list-products');
      setProducts(response.data);  // Update the products state with fetched data
      setMessage('Products retrieved successfully');
    } catch (error) {
      setMessage('Error listing products');
      console.error(error);  // Log the error for debugging
    }
  };

  // Function to create a product in Stripe
  const createStripeProduct = async () => {
    try {
      const response = await axios.post('/api/create-product');
      setMessage('Product Created: ' + response.data.name);
    } catch (error) {
      setMessage('Error creating product');
      console.error(error);
    }
  };
}
  // Function to create a shipping label in Ship
