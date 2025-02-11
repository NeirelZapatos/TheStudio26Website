import React, { useState } from 'react';
import useSWR from 'swr';
import { IOrder } from '@/app/models/Order';
import Buttons from './Buttons';	
import OrderTables from './OrderTables';
import SortOrders, { OrderFilter } from '../SortOrders';
import exportOrdersToCSV from '../ExportReport';
import generateReceiptPDF from '../GenerateReceipt';
import ProcessPickup from '../ProcessPickup';
import { printShippingLabels } from '../PrintShippingLabels';
import SearchBar from './SearchBar';

const fetcher = async (url: string): Promise<IOrder[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch orders');
  const data: IOrder[] = await response.json();

  const enrichedOrders = await Promise.all(
    data.map(async (order) => {
      try {
        const customerResponse = await fetch(`/api/customers/${order.customer_id}`);
        if (!customerResponse.ok) throw new Error('Failed to fetch customer');
        const customer = await customerResponse.json();

        const products = await Promise.all(
          (order.product_items || []).map(async (productId) => {
            const productResponse = await fetch(`/api/items/${productId}`);
            if (!productResponse.ok) throw new Error('Failed to fetch product');
            const product = await productResponse.json();

            const quantity = order.products?.find(
              (p) => p.product.toString() === productId.toString()
            )?.quantity || 1;

            return { product, quantity };
          })
        );

        return {
          ...order,
          customer,
          products: products.filter((p) => p.product !== null),
        } as IOrder;
      } catch (error) {
        console.error('Error enriching order:', error);
        return null;
      }
    })
  );

  return enrichedOrders.filter((order) => 
    order !== null && 
    order.customer?.first_name && 
    order.customer?.last_name
  ) as IOrder[];
};

const ManageOrders = () => {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>(OrderFilter.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<IOrder[]>([]);


  const { data: orders, error, mutate } = useSWR<IOrder[]>('/api/orders', fetcher, {
    refreshInterval: 300000,
  });

  const handleMarkAsFulfilled = async () => {
    if (!orders) {
      alert('Orders data not loaded yet');
      return;
    }
  
    const selectedOrderIds = Array.from(selectedOrders);
    const selectedOrdersData = orders.filter(order => 
      selectedOrderIds.includes(order._id.toString())
    );
  
    const nonPickupOrders = selectedOrdersData.filter(
      order => order.shipping_method !== 'Pickup'
    );
    if (nonPickupOrders.length > 0) {
      alert('Cannot fulfill delivery orders. Select only pickup orders.');
      return;
    }
  
    try {
      await ProcessPickup(selectedOrderIds, 'fulfilled', mutate);
      setSelectedOrders(new Set());
    } catch (error) {
      console.error('Error fulfilling orders:', error);
      alert('Failed to mark orders as fulfilled.');
    }
  };

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

  const handlePrintShippingLabels = async () => {
    try {
        const labels = await printShippingLabels(Array.from(selectedOrders), orders || []);
        if (labels.length > 0) {
            alert('Shipping labels printed successfully!');
        } else {
            alert('No labels were generated. Please check the selected orders and try again.');
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error printing shipping labels:', error.message);
            alert(`Failed to print shipping labels: ${error.message}`);
        } else {
            console.error('Unknown error printing shipping labels:', error);
            alert('Failed to print shipping labels: Unknown error');
        }
    }
  };

  const handleExportReport = () => {
    if (orders) {
      exportOrdersToCSV(orders);
    }
  };

  const handlePrintReceipt = () => {
    if (orders) {
      selectedOrders.forEach((orderId) => {
        const order = orders.find((order) => order._id.toString() === orderId);
        if (order) {
          generateReceiptPDF(order);
        }
      });
    }
  };

  const getTimeElapsed = (orderDate: string) => {
    const orderTime = new Date(orderDate).getTime();
    const now = Date.now();
    const diff = now - orderTime;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const filteredOrders = orders ? SortOrders(orders, activeFilter, searchQuery) : [];
  const validOrders = orders?.filter(order => 
    order.customer?.first_name && 
    order.customer?.last_name
  ) || [];

  const filterButtons = [
    { 
      label: 'All Orders', 
      value: OrderFilter.ALL, 
      count: validOrders.length
    },
    {
      label: 'Pickup',
      value: OrderFilter.PICKUP,
      count: validOrders.filter(order => 
        order.shipping_method === 'Pickup' && 
        order.order_status !== 'fulfilled'
      ).length,
    },
    {
      label: 'Priority',
      value: OrderFilter.PRIORITY,
      count: validOrders.filter((order) => {
        const orderAge = (Date.now() - new Date(order.order_date).getTime()) / (1000 * 60 * 60 * 24);
        return (
          order.order_status === 'pending' &&
          (order.shipping_method === 'Express' ||
            order.shipping_method === 'Next Day' ||
            order.shipping_method === 'Priority' ||
            ((order.shipping_method === 'Standard' || order.shipping_method === 'Ground') &&
              orderAge > 3))
        );
      }).length,
    },
    {
      label: 'Pending',
      value: OrderFilter.PENDING,
      count: validOrders.filter((order) => order.order_status === 'pending').length,
    },
    {
      label: 'Deliveries',
      value: OrderFilter.DELIVERIES,
      count: validOrders.filter(order => 
        order.shipping_method !== 'Pickup' && 
        order.order_status === 'pending'
      ).length,
    },
    {
      label: 'Fulfilled',
      value: OrderFilter.FULFILLED,
      count: validOrders.filter(order => 
        ['shipped', 'fulfilled', 'delivered'].includes(order.order_status)
      ).length,
    },
  ];

  if (!orders) {
    return <div className="flex justify-center items-center h-64">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  const handleToggleDetails = (orderId: string) => {
    setExpandedOrder((prevOrderId) => (prevOrderId === orderId ? null : orderId));
  };

  return (
    <div className="space-y-6">
      <div>
        <Buttons
          selectedOrdersSize={selectedOrders.size}
          selectedOrders={selectedOrders}
          filterButtons={filterButtons}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          handlePrintShippingLabels={handlePrintShippingLabels}
          handlePrintReceipt={handlePrintReceipt}
          handleMarkAsFulfilled={handleMarkAsFulfilled}
          orders={orders}
        />
      </div>
  
      <div className="mb-4">
        <SearchBar
          orders={orders}
          onSearchResults={setSearchResults}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>
  
      <OrderTables
        filteredOrders={filteredOrders}
        selectedOrders={selectedOrders}
        expandedOrder={expandedOrder}
        handleSelectAll={handleSelectAll}
        handleSelectOrder={handleSelectOrder}
        handleToggleDetails={handleToggleDetails}
        getTimeElapsed={getTimeElapsed}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default ManageOrders;
