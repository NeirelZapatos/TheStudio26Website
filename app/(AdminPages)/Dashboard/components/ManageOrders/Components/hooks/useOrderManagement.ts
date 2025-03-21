import { useState } from 'react';
import useSWR from 'swr';
import { IOrder } from '@/app/models/Order';
import { OrderFilter } from '@/utils/sortOrders';
import { fetchOrders } from '@/utils/fetchUtils/fetchOrders';
import { searchOrders } from '@/utils/searchUtils'; // Import the searchOrders function

export const useOrderManagement = () => {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>(OrderFilter.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<IOrder[]>([]);

  const { data: orders, error, mutate } = useSWR<IOrder[]>('/api/orders', fetchOrders, {
    refreshInterval: 300000,
  });

  // Recalculate filteredOrders whenever searchQuery, activeFilter, or orders change
  const filteredOrders = orders ? searchOrders(orders, searchQuery) : [];
  const validOrders = orders?.filter(order => order.customer?.first_name && order.customer?.last_name) || [];

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((order) => order._id.toString())));
    }
  };

  const handleToggleDetails = (orderId: string) => {
    setExpandedOrder((prevOrderId) => (prevOrderId === orderId ? null : orderId));
  };

  return {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    selectedOrders,
    setSelectedOrders,
    expandedOrder,
    setExpandedOrder,
    searchResults,
    setSearchResults,
    orders,
    error,
    mutate,
    filteredOrders, // Return the filtered orders
    validOrders,
    handleSelectOrder,
    handleSelectAll,
    handleToggleDetails,
  };
};