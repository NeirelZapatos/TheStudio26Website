import React, { useState, useEffect } from 'react'; // Import React and useState hook
import useSWR from 'swr'; // Import useSWR for data fetching
import { IOrder } from '@/app/models/Order'; // Import IOrder interface
import Buttons from './Buttons'; // Import Buttons component
import OrderTables from './OrderTables'; // Import OrderTables component
import SortOrders, { OrderFilter } from '@/utils/sortOrders'; // Import SortOrders utility and OrderFilter enum
import exportOrdersToCSV from '@/utils/ExportReport'; // Import exportOrdersToCSV utility
import generateReceiptPDF from '@/utils/GenerateReceipt'; // Import generateReceiptPDF utility
import ProcessPickup from '../ProcessPickup'; // Import ProcessPickup utility
import { printShippingLabels } from '../PrintShippingLabels'; // Import printShippingLabels utility
import SearchBar from './SearchBar'; // Import SearchBar component
import { fetchOrders } from '@/utils/fetchUtils/fetchOrders'; // Import fetchOrders utility
import  PackageDetailsModal  from './PackageDetailsModal';
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

interface PackageDetails {
  length: number;
  width: number;
  height: number;
  weight: number;
}

const ManageOrders = () => {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>(OrderFilter.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<IOrder[]>([]);
  const [packageDetails, setPackageDetails] = useState<PackageDetails[]>([]);
  const [isPackageModalOpen, setPackageModalOpen] = useState(false);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const [hasBeenInitialized, setHasBeenInitialized] = useState<boolean[]>([]);

  const { data: orders, error, mutate } = useSWR<IOrder[]>('/api/orders', fetchOrders, {
    refreshInterval: 300000,
  });

  // Initialize hasBeenInitialized when selectedOrders changes
  useEffect(() => {
    setHasBeenInitialized(new Array(selectedOrders.size).fill(false));
  }, [selectedOrders.size]);

  // Handle package details submission
  const handlePackageDetailsSubmit = (details: PackageDetails) => {
    const newPackageDetails = [...packageDetails];
    newPackageDetails[currentPackageIndex] = details;
    setPackageDetails(newPackageDetails);

    const newHasBeenInitialized = [...hasBeenInitialized];
    newHasBeenInitialized[currentPackageIndex] = true;
    setHasBeenInitialized(newHasBeenInitialized);

    if (currentPackageIndex < selectedOrders.size - 1) {
      setCurrentPackageIndex(currentPackageIndex + 1);
    } else {
      printLabels(newPackageDetails);
      setPackageModalOpen(false);
      setPackageDetails([]);
      setHasBeenInitialized([]);
      setCurrentPackageIndex(0);
    }
  };

  // Initialize package details when modal opens
  useEffect(() => {
    if (isPackageModalOpen && selectedOrders.size > 0) {
      // If the current package hasn't been initialized, reset its input fields
      if (!hasBeenInitialized[currentPackageIndex]) {
        setPackageDetails((prev) => {
          const updatedDetails = [...prev];
          updatedDetails[currentPackageIndex] = { length: 0, width: 0, height: 0, weight: 0 };
          return updatedDetails;
        });
      }
    }
  }, [isPackageModalOpen, currentPackageIndex, hasBeenInitialized, selectedOrders.size]);

  // Handle printing labels for all packages
  const printLabels = async (details: PackageDetails[]) => {
    try {
      const labels = await printShippingLabels(
        Array.from(selectedOrders),
        orders || [],
        details
      );

      if (labels.length > 0) {
        alert('Shipping labels printed successfully!');
        // Reset the printShippingLabels button and checkboxes state
        setSelectedOrders(new Set());
        setPackageDetails([]);
        setHasBeenInitialized([]);
        setCurrentPackageIndex(0);
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

  // Simplified handler - just check if we have details, or open modal
  const handlePrintShippingLabels = () => {
    if (packageDetails.length === selectedOrders.size) {
      printLabels(packageDetails);
    } else {
      setPackageModalOpen(true);
    }
  };

  // Handle marking orders as fulfilled
  const handleMarkAsFulfilled = async () => {
    if (!orders) {
      alert('Orders data not loaded yet'); // Alert if orders data is not loaded
      return;
    }

    const selectedOrderIds = Array.from(selectedOrders); // Convert selected orders to an array
    const selectedOrdersData = orders.filter(order => 
      selectedOrderIds.includes(order._id.toString()) // Filter selected orders
    );

    const nonPickupOrders = selectedOrdersData.filter(
      order => order.shipping_method !== 'Pickup' // Filter out non-pickup orders
    );
    if (nonPickupOrders.length > 0) {
      alert('Cannot fulfill delivery orders. Select only pickup orders.'); // Alert if non-pickup orders are selected
      return;
    }

    try {
      await ProcessPickup(selectedOrderIds, 'fulfilled', mutate); // Process pickup orders
      setSelectedOrders(new Set()); // Clear selected orders
    } catch (error) {
      console.error('Error fulfilling orders:', error); // Log error if fulfillment fails
      alert('Failed to mark orders as fulfilled.'); // Alert user of failure
    }
  };

  // Handle selecting/deselecting an order
  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev); // Create a new Set to avoid mutation
      if (newSet.has(orderId)) {
        newSet.delete(orderId); // Deselect if already selected
      } else {
        newSet.add(orderId); // Select if not already selected
      }
      return newSet;
    });
  };

  // Handle selecting/deselecting all orders
  const handleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set()); // Deselect all if all are selected
    } else {
      setSelectedOrders(new Set(filteredOrders.map((order) => order._id.toString()))); // Select all
    }
  };

  // Handle exporting orders to CSV
  const handleExportReport = () => {
    if (orders) {
      exportOrdersToCSV(orders); // Export orders to CSV
    }
  };

  // Handle printing receipts for selected orders
  const handlePrintReceipt = () => {
    if (orders) {
      selectedOrders.forEach((orderId) => {
        const order = orders.find((order) => order._id.toString() === orderId); // Find selected order
        if (order) {
          generateReceiptPDF(order); // Generate receipt PDF
        }
      });
    }
  };

  // Calculate time elapsed since order was placed
  const getTimeElapsed = (orderDate: string) => {
    const orderTime = new Date(orderDate).getTime(); // Get order timestamp
    const now = Date.now(); // Get current timestamp
    const diff = now - orderTime; // Calculate difference

    const minutes = Math.floor(diff / (1000 * 60)); // Convert to minutes
    const hours = Math.floor(minutes / 60); // Convert to hours
    const days = Math.floor(hours / 24); // Convert to days

    if (days > 0) return `${days}d ago`; // Return days if > 0
    if (hours > 0) return `${hours}h ago`; // Return hours if > 0
    return `${minutes}m ago`; // Return minutes
  };

  // Filter and sort orders - moved before the dependency is used
  const filteredOrders = orders ? SortOrders(orders, activeFilter, searchQuery) : [];
  
  // Filter out orders with invalid customer data
  const validOrders = orders?.filter(order => 
    order.customer?.first_name && 
    order.customer?.last_name
  ) || [];

  // Define filter buttons with counts
  const filterButtons = [
    { 
      label: 'All Orders', 
      value: OrderFilter.ALL, 
      count: validOrders.length // Count of all valid orders
    },
    {
      label: 'Pickup',
      value: OrderFilter.PICKUP,
      count: validOrders.filter(order => 
        order.shipping_method === 'Pickup' && 
        order.order_status !== 'fulfilled' // Count of pickup orders
      ).length,
    },
    {
      label: 'Priority',
      value: OrderFilter.PRIORITY,
      count: validOrders.filter((order) => {
        const orderAge = (Date.now() - new Date(order.order_date).getTime()) / (1000 * 60 * 60 * 24); // Calculate order age
        return (
          order.order_status === 'pending' &&
          (order.shipping_method === 'Express' ||
            order.shipping_method === 'Next Day' ||
            order.shipping_method === 'Priority' ||
            ((order.shipping_method === 'Standard' || order.shipping_method === 'Ground') &&
              orderAge > 3)) // Count of priority orders
        );
      }).length,
    },
    {
      label: 'Pending',
      value: OrderFilter.PENDING,
      count: validOrders.filter((order) => order.order_status === 'pending').length, // Count of pending orders
    },
    {
      label: 'Deliveries',
      value: OrderFilter.DELIVERIES,
      count: validOrders.filter(order => 
        order.shipping_method !== 'Pickup' && 
        order.order_status === 'pending' // Count of delivery orders
      ).length,
    },
    {
      label: 'Fulfilled',
      value: OrderFilter.FULFILLED,
      count: validOrders.filter(order => 
        ['shipped', 'fulfilled', 'delivered'].includes(order.order_status?? '') // Count of fulfilled orders
      ).length,
    },
  ];

  // Handle toggling order details
  const handleToggleDetails = (orderId: string) => {
    setExpandedOrder((prevOrderId) => (prevOrderId === orderId ? null : orderId)); // Toggle expanded order
  };

  // Early return for loading and error states - moved to after all hooks
  if (!orders) {
    return <div className="flex justify-center items-center h-64">Loading orders...</div>; // Show loading state
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>; // Show error state
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