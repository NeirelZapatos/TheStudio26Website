// Updated useOrderActions hook
import { useState } from 'react';
import { ProcessPickup } from '@/utils/orderUtils/ProcessPickup';
import exportOrdersToCSV from '@/utils/docUtils/ExportReport';
import generateReceiptPDF from '@/utils/docUtils/GenerateReceipt';
import { IOrder } from '@/app/models/Order';

type MutateFunction = () => Promise<any>;

export const useOrderActions = (
  orders: IOrder[] | null, 
  selectedOrders: Set<string>, 
  mutate: MutateFunction,
  setSelectedOrders: React.Dispatch<React.SetStateAction<Set<string>>>
) => {
      // Check if all selected orders are pickup orders
const hasOnlyPickupOrders = () => {
  if (!orders) return false;
  
  const selectedOrderIds = Array.from(selectedOrders);
  if (selectedOrderIds.length === 0) return false;
  
  const selectedOrdersData = orders.filter(order => selectedOrderIds.includes(order._id.toString()));
  return selectedOrdersData.every(order => 
    order.shipping_method?.toLowerCase() === 'pickup'
  );
};

  
  // Check if any selected order is a delivery order
const hasDeliveryOrders = () => {
  if (!orders) return false;
  
  const selectedOrderIds = Array.from(selectedOrders);
  if (selectedOrderIds.length === 0) return false;
  
  const selectedOrdersData = orders.filter(order => selectedOrderIds.includes(order._id.toString()));
  return selectedOrdersData.some(order => 
    order.shipping_method?.toLowerCase() === 'delivery'
  );
};

  const handleMarkAsFulfilled = async () => {
    if (!orders) {
      alert('Orders data not loaded yet');
      return;
    }



    const selectedOrderIds = Array.from(selectedOrders);
    const selectedOrdersData = orders.filter(order => selectedOrderIds.includes(order._id.toString()));

    // Double-check that all selected orders are pickup orders
    if (!selectedOrdersData.every(order => order.shipping_method === 'pickup')) {
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

  const handleExportReport = () => {
    if (orders) {
      exportOrdersToCSV(orders);
    }
  };

  const handlePrintReceipt = () => {
    if (orders) {
      selectedOrders.forEach((orderId: string) => {
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

  return {
    handleMarkAsFulfilled,
    handleExportReport,
    handlePrintReceipt,
    getTimeElapsed,
    hasOnlyPickupOrders,
    hasDeliveryOrders
  };
};