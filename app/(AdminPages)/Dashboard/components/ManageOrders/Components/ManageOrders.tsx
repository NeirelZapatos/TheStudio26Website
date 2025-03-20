import React, { useState, useEffect } from 'react'; // Import React and useState hook
import Buttons from './Buttons'; // Import Buttons component
import OrderTables from './OrderTables'; // Import OrderTables component
import SearchBar from './SearchBar'; // Import SearchBar component
import  PackageDetailsModal  from './PackageDetailsModal';
import { useOrderManagement } from './hooks/useOrderManagement';
import { usePackageManagement } from './hooks/usePackageManagement';
import exportOrdersToCSV from '@/utils/ExportReport';
import ProcessPickup from '../ProcessPickup';
import generateReceiptPDF from '@/utils/GenerateReceipt';
import { OrderFilter } from '@/utils/sortOrders';

/**
 * ManageOrders Component:
 * Main component for managing orders, including filtering, searching, selecting, and performing actions like exporting, printing, and marking orders as fulfilled.
 * 
 * State:
 * - activeFilter: Currently active filter for orders (e.g., ALL, PICKUP, PRIORITY, etc.).
 * - searchQuery: Current search query for filtering orders.
 * - selectedOrders: Set of selected order IDs for bulk actions.
 * - expandedOrder: ID of the currently expanded order to show details.
 * - searchResults: Array of orders matching the search query.
 * - isPackageModalOpen: Boolean state to control package details modal visibility.
 * - selectedForShipping: Array of order IDs selected for shipping label generation.
 * 
 * Props:
 * None (This is a standalone component).
 * 
 * Utilities/Functions:
 * - SortOrders: Utility to filter and sort orders based on active filter and search query.
 * - exportOrdersToCSV: Utility to export orders to a CSV file.
 * - generateReceiptPDF: Utility to generate and print receipts for selected orders.
 * - ProcessPickup: Utility to process pickup orders and mark them as fulfilled.
 * - printShippingLabels: Utility to print shipping labels for selected orders.
 * - fetchOrders: Utility to fetch orders from the API using SWR.
 * 
 * Subcomponents:
 * - Buttons: Component for action buttons (export, print, filter, etc.).
 * - OrderTables: Component for displaying and interacting with the orders table.
 * - SearchBar: Component for searching and filtering orders.
 * - PackageDetailsModal: Component for collecting package dimensions and weight.
 * 
 * Handlers:
 * - handleMarkAsFulfilled: Marks selected pickup orders as fulfilled.
 * - handleSelectOrder: Handles selecting/deselecting an individual order.
 * - handleSelectAll: Handles selecting/deselecting all orders.
 * - handlePrintShippingLabels: Prints shipping labels for selected orders.
 * - handleExportReport: Exports orders to a CSV file.
 * - handlePrintReceipt: Prints receipts for selected orders.
 * - handleToggleDetails: Toggles the expanded view of an order's details.
 * - getTimeElapsed: Calculates the time elapsed since an order was placed.
 * - handlePackageDetailsSubmit: Handles submission of package details for shipping labels.
 * 
 * Data Fetching:
 * - Uses SWR to fetch orders from the API with a refresh interval of 5 minutes.
 * 
 * Error Handling:
 * - Displays loading state while fetching orders.
 * - Displays error message if fetching orders fails.
 * 
 * Filter Buttons:
 * - Dynamically generates filter buttons with counts for different order statuses and types (e.g., All Orders, Pickup, Priority, etc.).
 */


const ManageOrders = () => {
  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    selectedOrders,
    setSelectedOrders, // Destructure setSelectedOrders
    expandedOrder,
    setExpandedOrder,
    searchResults,
    setSearchResults,
    orders,
    error,
    mutate,
    filteredOrders,
    validOrders,
    handleSelectOrder,
    handleSelectAll,
    handleToggleDetails,
  } = useOrderManagement();

  const {
    packageDetails,
    setPackageDetails,
    isPackageModalOpen,
    setPackageModalOpen,
    currentPackageIndex,
    setCurrentPackageIndex,
    handlePackageDetailsSubmit,
    handlePrintShippingLabels,
  } = usePackageManagement(selectedOrders, orders, setSelectedOrders); // Pass setSelectedOrders as the third argument

  const handleMarkAsFulfilled = async () => {
    if (!orders) {
      alert('Orders data not loaded yet');
      return;
    }

    const selectedOrderIds = Array.from(selectedOrders);
    const selectedOrdersData = orders.filter(order => selectedOrderIds.includes(order._id.toString()));

    const nonPickupOrders = selectedOrdersData.filter(order => order.shipping_method !== 'Pickup');
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

  const filterButtons = [
    { label: 'All Orders', value: OrderFilter.ALL, count: validOrders.length },
    { label: 'Pickup', value: OrderFilter.PICKUP, count: validOrders.filter(order => order.shipping_method === 'Pickup' && order.order_status !== 'fulfilled').length },
    { label: 'Priority', value: OrderFilter.PRIORITY, count: validOrders.filter((order) => {
      const orderAge = (Date.now() - new Date(order.order_date).getTime()) / (1000 * 60 * 60 * 24);
      return (
        order.order_status === 'pending' &&
        (order.shipping_method === 'Express' ||
          order.shipping_method === 'Next Day' ||
          order.shipping_method === 'Priority' ||
          ((order.shipping_method === 'Standard' || order.shipping_method === 'Ground') &&
            orderAge > 3))
      );
    }).length },
    { label: 'Pending', value: OrderFilter.PENDING, count: validOrders.filter((order) => order.order_status === 'pending').length },
    { label: 'Deliveries', value: OrderFilter.DELIVERIES, count: validOrders.filter(order => order.shipping_method !== 'Pickup' && order.order_status === 'pending').length },
    { label: 'Fulfilled', value: OrderFilter.FULFILLED, count: validOrders.filter(order => ['shipped', 'fulfilled', 'delivered'].includes(order.order_status?? '')).length },
  ];

  if (!orders) {
    return <div className="flex justify-center items-center h-64">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <Buttons
        selectedOrdersSize={selectedOrders.size}
        selectedOrders={selectedOrders}
        filterButtons={filterButtons}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        handlePrintShippingLabels={handlePrintShippingLabels}
        handlePrintReceipt={handlePrintReceipt}
        handleMarkAsFulfilled={handleMarkAsFulfilled}
        orders={orders || []}
      />
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

      <PackageDetailsModal
        isOpen={isPackageModalOpen}
        onClose={() => setPackageModalOpen(false)}
        onSubmit={handlePackageDetailsSubmit}
        initialValues={packageDetails[currentPackageIndex] || undefined}
        onClear={() => setPackageDetails([])}
        currentPackageIndex={currentPackageIndex}
        totalPackages={selectedOrders.size}
        onPrevious={() => setCurrentPackageIndex(currentPackageIndex - 1)}
        onNext={() => setCurrentPackageIndex(currentPackageIndex + 1)}
        customerName={`${orders.find(order => order._id.toString() === Array.from(selectedOrders)[currentPackageIndex])?.customer?.first_name || 'N/A'} ${orders.find(order => order._id.toString() === Array.from(selectedOrders)[currentPackageIndex])?.customer?.last_name || ''}`}
        orderId={Array.from(selectedOrders)[currentPackageIndex]}
      />
    </div>
  );
};

export default ManageOrders;