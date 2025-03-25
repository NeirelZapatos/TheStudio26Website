import { useState } from 'react';
import useSWR from 'swr';
import { IOrder } from '@/app/models/Order';
import { OrderFilter, SortOrders } from '@/utils/sortOrders';
import { fetchOrders } from '@/utils/fetchUtils/fetchOrders';
import { searchOrders } from '@/utils/searchUtils';

export const useOrderManagement = () => {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>(OrderFilter.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<IOrder[]>([]);

  const { data: orders, error, mutate } = useSWR<IOrder[]>('/api/orders', fetchOrders, {
    refreshInterval: 300000,
  });

  // First filter orders based on search query
  const searchFilteredOrders = orders ? searchOrders(orders, searchQuery) : [];
  
  // Then sort the filtered orders based on priority
  const filteredOrders = searchFilteredOrders ? SortOrders(searchFilteredOrders, activeFilter) : [];
  
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
    filteredOrders, // Return the filtered and sorted orders
    validOrders,
    handleSelectOrder,
    handleSelectAll,
    handleToggleDetails,
  };
};