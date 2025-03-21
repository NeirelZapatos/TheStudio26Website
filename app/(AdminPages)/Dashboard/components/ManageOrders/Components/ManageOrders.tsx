import React, { useState, useEffect } from 'react'; // Import React and useState hook
import Buttons from './Buttons'; // Import Buttons component
import OrderTables from './OrderTables'; // Import OrderTables component
import SearchBar from './SearchBar'; // Import SearchBar component
import PackageDetailsModal from './PackageDetailsModal';
import { useOrderManagement } from './hooks/useOrderManagement';
import { usePackageManagement } from './hooks/usePackageManagement';
import { useOrderActions } from './hooks/useOrderActions'; // Import the hook
import { useOrderFilters } from './hooks/useOrderFilters'; // Import the hook



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
    setSelectedOrders,
    expandedOrder,
    setSearchResults,
    orders,
    error,
    mutate,
    filteredOrders, // This is already filtered based on the searchQuery
    validOrders,
    handleSelectOrder,
    handleSelectAll,
    handleToggleDetails,
  } = useOrderManagement();

  const {
    packageDetails,
    isPackageModalOpen,
    setPackageModalOpen,
    currentPackageIndex,
    setCurrentPackageIndex,
    handlePackageDetailsSubmit,
    handlePrintShippingLabels,
    modifiedDetails,
    handleTemporaryUpdate
  } = usePackageManagement(selectedOrders, orders, setSelectedOrders);

  const {
    handleMarkAsFulfilled,
    handlePrintReceipt,
    getTimeElapsed,
  } = useOrderActions(orders || null, selectedOrders, mutate, setSelectedOrders);

  const { filterButtons } = useOrderFilters(validOrders || []);

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
        filteredOrders={filteredOrders} // Pass the filtered orders to OrderTables
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
        currentPackageIndex={currentPackageIndex}
        totalPackages={selectedOrders.size}
        onPrevious={() => setCurrentPackageIndex(currentPackageIndex - 1)}
        onNext={() => setCurrentPackageIndex(currentPackageIndex + 1)}
        customerName={`${orders.find(order => order._id.toString() === Array.from(selectedOrders)[currentPackageIndex])?.customer?.first_name || 'N/A'} ${orders.find(order => order._id.toString() === Array.from(selectedOrders)[currentPackageIndex])?.customer?.last_name || ''}`}
        orderId={Array.from(selectedOrders)[currentPackageIndex]}
        modifiedDetails={modifiedDetails}
        handleTemporaryUpdate={handleTemporaryUpdate}
      />
    </div>
  );
};

export default ManageOrders;