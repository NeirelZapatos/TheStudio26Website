import React from 'react'; // Import React and useState hook
import Buttons from './Buttons'; // Import Buttons component
import OrderTables from './OrderTables'; // Import OrderTables component
import SearchBar from './SearchBar'; // Import SearchBar component
import PackageDetailsModal from '@/app/(AdminPages)/Dashboard/components/ManageOrders/Components/PackageDetailsModal';  
import { useOrderManagement } from '../hooks/useOrderManagement';
import { usePackageManagement } from '../hooks/usePackageManagement';
import { useOrderActions } from '../hooks/useOrderActions'; 
import { useOrderFilters } from '../hooks/useOrderFilters'; 

/**
 * Resolves shipping method strings into standardized display values.
 * @param {string | undefined} method - The shipping method to normalize
 * @returns {string} - The standardized shipping method display value
 */
const resolveShippingMethod = (method?: string): string => {
  if (!method) return '';
  const lower = method.toLowerCase();

  // Convert all these cases to 'Delivery'
  if (
    lower === 'standard' ||
    lower.startsWith('rate_') ||
    lower.startsWith('shr_') ||  // Added for rate IDs like Shr_1RD8KuBoMBkg4rm6KNjLVXsz
    lower.includes('ground') ||
    lower.includes('usps') ||
    lower.includes('advantage')
  ) {
    return 'Delivery';
  }

  // Keep 'Pickup' or anything else unchanged (but capitalized)
  return method.charAt(0).toUpperCase() + method.slice(1);
};

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
    filteredOrders,
    handleSelectOrder,
    handleSelectAll,
    handleToggleDetails,
  } = useOrderManagement();

  // Pre-process orders to standardize shipping method display values
  const processedOrders = (filteredOrders || []).map(order => ({
    ...order,
    shipping_method_display: resolveShippingMethod(order.shipping_method)
  }));

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
    hasOnlyPickupOrders,
    hasOnlyDeliveryOrders,
    hasDeliveryOrders,
    hasOnlyShippableOrders // Use this function to check if all selected orders are delivery + pending
  } = useOrderActions(orders || null, selectedOrders, mutate, setSelectedOrders);
  
  const { filterButtons } = useOrderFilters(orders || []);

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
        setActiveFilter={(filter) => setActiveFilter(filter)}
        handlePrintShippingLabels={handlePrintShippingLabels}
        handlePrintReceipt={handlePrintReceipt}
        handleMarkAsFulfilled={handleMarkAsFulfilled}
        orders={orders || []}
        hasOnlyPickupOrders={hasOnlyPickupOrders}
        hasOnlyDeliveryOrders={hasOnlyDeliveryOrders}
        hasDeliveryOrders={hasDeliveryOrders}
        hasOnlyShippableOrders={hasOnlyShippableOrders} // Pass this function to Buttons
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
        filteredOrders={filteredOrders} // Use original filteredOrders instead of processedOrders
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