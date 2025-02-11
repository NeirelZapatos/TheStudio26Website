// SearchBar.tsx
import React, { useState, useEffect } from 'react';
import { IOrder } from '@/app/models/Order';

interface SearchBarProps {
  orders: IOrder[];
  onSearchResults: (filteredOrders: IOrder[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar = ({ orders, onSearchResults, searchQuery, setSearchQuery }: SearchBarProps) => {
  useEffect(() => {
    const searchOrders = () => {
      const query = searchQuery.toLowerCase();
      const filtered = orders.filter((order) => {
        const customerName = `${order.customer?.first_name} ${order.customer?.last_name}`.toLowerCase();
        const orderId = order._id.toString().toLowerCase();
        const orderStatus = order.order_status.toLowerCase();
        const shippingMethod = order.shipping_method.toLowerCase();
        
        // Search across multiple fields
        return (
          customerName.includes(query) ||
          orderId.includes(query) ||
          orderStatus.includes(query) ||
          shippingMethod.includes(query) ||
          // Search through products if they exist
          order.products?.some(
            (p) => p.product.name.toLowerCase().includes(query)
          )
        );
      });
      
      onSearchResults(filtered);
    };

    searchOrders();
  }, [searchQuery, orders, onSearchResults]);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
      <input
        type="text"
        placeholder="Search by customer name, order ID, status, or products..."
        className="w-full pl-10 pr-4 py-2 border rounded-lg"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
      />
    </div>
  );
};

export default SearchBar;
