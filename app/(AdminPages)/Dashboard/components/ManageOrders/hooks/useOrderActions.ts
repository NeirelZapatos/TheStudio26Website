import { useState } from 'react';
import { ProcessPickup } from '@/utils/orderUtils/ProcessPickup';
import exportOrdersToCSV from '@/utils/docUtils/ExportReport';
import generateReceiptPDF from '@/utils/docUtils/GenerateReceipt';
import { IOrder } from '@/app/models/Order';

/**
 * Helper function to check if an order is in pending state
 */
const isPendingOrder = (order: IOrder): boolean => {
  if (!order.order_status) return true; 
  const status = order.order_status.toLowerCase();
  return status === 'pending';
};

/**
 * Helper function to check if an order is a class booking
 */
const isClassBooking = (order: IOrder): boolean => {
  return order.order_type === 'class_booking';
};

/**
 * Helper function to check if an order is a pickup order by checking the delivery_method or is_pickup fields
 */
const isPickupOrder = (order: IOrder): boolean => {
  // Check if it has the is_pickup flag
  if (order.is_pickup === true) return true;
  
  // Check if it has delivery_method set to pickup
  if (order.delivery_method && order.delivery_method.toLowerCase() === 'pickup') return true;
  
  // Otherwise, it's not a pickup order
  return false;
};

/**
 * Helper function to check if an order is a delivery order
 */
const isDeliveryOrder = (order: IOrder): boolean => {
  // If it's a pickup order, it's not a delivery order
  if (isPickupOrder(order)) return false;
  
  // If it's a class booking, it's not a delivery order
  if (isClassBooking(order)) return false;
  
  // By process of elimination, it must be a delivery order
  return true;
};

/**
 * Helper function to check if an order is shippable (delivery + pending)
 */
const isShippableOrder = (order: IOrder): boolean => {
  // An order is shippable if it's a delivery order and it's in pending status
  return isDeliveryOrder(order) && isPendingOrder(order);
};

interface OrderActionsReturn {
  handleMarkAsFulfilled: () => Promise<void>;
  handleExportReport: () => void;
  handlePrintReceipt: () => void;
  handlePrintShippingLabels: () => void;
  getTimeElapsed: (orderDate: string) => string;
  hasOnlyPickupOrders: () => boolean;
  hasDeliveryOrders: () => boolean;
  hasOnlyDeliveryOrders: () => boolean;
  hasOnlyShippableOrders: () => boolean;
}

export const useOrderActions = (
  orders: IOrder[] | null, 
  selectedOrders: Set<string>, 
  mutate: () => Promise<any>,
  setSelectedOrders: React.Dispatch<React.SetStateAction<Set<string>>>
): OrderActionsReturn => {
  // Check if all selected orders are pickup orders
  const hasOnlyPickupOrders = (): boolean => {
    if (!orders) return false;
    
    const selectedOrderIds = Array.from(selectedOrders);
    if (selectedOrderIds.length === 0) return false;
    
    const selectedOrdersData = orders.filter(order => selectedOrderIds.includes(order._id.toString()));
    return selectedOrdersData.every(order => isPickupOrder(order));
  };
  
  // Check if any selected order is a delivery order
  const hasDeliveryOrders = (): boolean => {
    if (!orders) return false;
    
    const selectedOrderIds = Array.from(selectedOrders);
    if (selectedOrderIds.length === 0) return false;
    
    const selectedOrdersData = orders.filter(order => selectedOrderIds.includes(order._id.toString()));
    return selectedOrdersData.some(order => isDeliveryOrder(order));
  };

  // Check if all selected orders are delivery orders
  const hasOnlyDeliveryOrders = (): boolean => {
    if (!orders) return false;
    
    const selectedOrderIds = Array.from(selectedOrders);
    if (selectedOrderIds.length === 0) return false;
    
    const selectedOrdersData = orders.filter(order => selectedOrderIds.includes(order._id.toString()));
    return selectedOrdersData.every(order => isDeliveryOrder(order));
  };

  // Check if all selected orders are delivery orders AND pending
  const hasOnlyShippableOrders = (): boolean => {
    if (!orders) return false;
    
    const selectedOrderIds = Array.from(selectedOrders);
    if (selectedOrderIds.length === 0) return false;
    
    const selectedOrdersData = orders.filter(order => selectedOrderIds.includes(order._id.toString()));
    return selectedOrdersData.every(order => isShippableOrder(order));
  };

  const handleMarkAsFulfilled = async (): Promise<void> => {
    if (!orders) {
      alert('Orders data not loaded yet');
      return;
    }

    const selectedOrderIds = Array.from(selectedOrders);
    const selectedOrdersData = orders.filter(order => selectedOrderIds.includes(order._id.toString()));

    // Double-check that all selected orders are pickup orders
    if (!selectedOrdersData.every(order => isPickupOrder(order))) {
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

  const handleExportReport = (): void => {
    if (orders) {
      exportOrdersToCSV(orders);
    }
  };

  const handlePrintReceipt = (): void => {
    if (orders) {
      selectedOrders.forEach((orderId: string) => {
        const order = orders.find((order) => order._id.toString() === orderId);
        if (order) {
          generateReceiptPDF(order);
        }
      });
    }
  };

  const handlePrintShippingLabels = (): void => {
    if (!orders) return;
    
    const selectedOrderIds = Array.from(selectedOrders);
    const selectedOrdersData = orders.filter(order => selectedOrderIds.includes(order._id.toString()));
    
    // Double-check that all selected orders are delivery orders and pending
    if (!selectedOrdersData.every(order => isShippableOrder(order))) {
      alert('Can only print shipping labels for pending delivery orders.');
      return;
    }
    
    // Implement your shipping label printing logic here
    // This is a placeholder implementation
    alert('Printing shipping labels for selected delivery orders');
    
    // Example implementation:
    // selectedOrdersData.forEach(order => {
    //   generateShippingLabel(order);
    // });
  };

  const getTimeElapsed = (orderDate: string): string => {
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
    handlePrintShippingLabels,
    getTimeElapsed,
    hasOnlyPickupOrders,
    hasDeliveryOrders,
    hasOnlyDeliveryOrders,
    hasOnlyShippableOrders,
  };
};