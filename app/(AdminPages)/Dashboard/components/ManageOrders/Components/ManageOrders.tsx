import { useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import SearchBar from './SearchBar';
import { useOrderManagement } from '../hooks/useOrderManagement';
import { usePackageManagement } from '../hooks/usePackageManagement';
import { useOrderActions } from '../hooks/useOrderActions';
import { useOrderFilters } from '../hooks/useOrderFilters';
import { OrderFilter } from '@/utils/filterUtils/filterOrders'; 
import { IOrder } from '@/app/models/Order';
// Client-side data caching setup
import { SWRConfig } from 'swr';
import Buttons from './Buttons';
import OrderTables from './OrderTables';

// Dynamic import for PackageDetailsModal with improved loading state
const PackageDetailsModal = dynamic(
  () => import('@/app/(AdminPages)/Dashboard/components/ManageOrders/Components/PackageDetailsModal'),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-40 w-full bg-gray-100 rounded"></div>
        </div>
      </div>
    ),
  }
);

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
    lower.startsWith('shr_') ||
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
  // Client-side data fetching with caching
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

  // Process orders only when needed (memoized)
  const processedOrders = useMemo(() => {
    return (filteredOrders || []).map(order => ({
      ...order,
      shipping_method_display: resolveShippingMethod(order.shipping_method)
    }));
  }, [filteredOrders]);

  // Package management with optimized operations
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
  } = usePackageManagement(selectedOrders, orders ?? [], setSelectedOrders);

  // Batch operations in useOrderActions
  const {
    handleMarkAsFulfilled,
    handlePrintReceipt,
    getTimeElapsed,
    hasOnlyPickupOrders,
    hasOnlyDeliveryOrders,
    hasDeliveryOrders,
    hasOnlyShippableOrders
  } = useOrderActions(orders ?? null, selectedOrders, mutate, setSelectedOrders);

  // Cached filter calculations
  const { filterButtons } = useOrderFilters(orders ?? []);

  // Loading and error states
  if (!orders) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-40 bg-gray-100 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
        Error: {error.message}
        <button 
          onClick={() => mutate()} 
          className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  // Optimized component rendering with SWR config for global caching
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 60000, // 1 minute
        focusThrottleInterval: 10000, // 10 seconds
      }}
    >
      <div className="space-y-6">
        <Buttons
          selectedOrdersSize={selectedOrders.size}
          selectedOrders={selectedOrders}
          filterButtons={filterButtons}
          activeFilter={activeFilter}
          setActiveFilter={(filter: OrderFilter) => setActiveFilter(filter)}
          handlePrintShippingLabels={handlePrintShippingLabels}
          handlePrintReceipt={handlePrintReceipt}
          handleMarkAsFulfilled={handleMarkAsFulfilled}
          orders={orders as IOrder[]}
          hasOnlyPickupOrders={hasOnlyPickupOrders}
          hasOnlyDeliveryOrders={hasOnlyDeliveryOrders}
          hasDeliveryOrders={hasDeliveryOrders}
          hasOnlyShippableOrders={hasOnlyShippableOrders}
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
          filteredOrders={processedOrders as unknown as IOrder[]} 
          selectedOrders={selectedOrders}
          expandedOrder={expandedOrder}
          handleSelectAll={handleSelectAll}
          handleSelectOrder={handleSelectOrder}
          handleToggleDetails={handleToggleDetails}
          getTimeElapsed={getTimeElapsed}
          searchQuery={searchQuery}
        />

        {/* Lazy-loaded modal with improved Suspense boundary */}
        <Suspense fallback={
          <div className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading package details...</span>
              </div>
            </div>
          </div>
        }>
          {isPackageModalOpen && (
            <PackageDetailsModal
              isOpen={isPackageModalOpen}
              onClose={() => setPackageModalOpen(false)}
              onSubmit={handlePackageDetailsSubmit}
              initialValues={packageDetails[currentPackageIndex] || undefined}
              currentPackageIndex={currentPackageIndex}
              totalPackages={selectedOrders.size}
              onPrevious={() => setCurrentPackageIndex(Math.max(0, currentPackageIndex - 1))}
              onNext={() => setCurrentPackageIndex(Math.min(selectedOrders.size - 1, currentPackageIndex + 1))}
              customerName={(() => {
                const orderId = Array.from(selectedOrders)[currentPackageIndex];
                const order = orders.find(order => order._id.toString() === orderId);
                return order ? 
                  `${order.customer?.first_name} ${order.customer?.last_name}`
                  : '';
              })()}
              orderId={Array.from(selectedOrders)[currentPackageIndex]}
              modifiedDetails={modifiedDetails}
              handleTemporaryUpdate={(details) => {
                const orderId = Array.from(selectedOrders)[currentPackageIndex];
                handleTemporaryUpdate(orderId, details);
              }}
            />
          )}
        </Suspense>
      </div>
    </SWRConfig>
  );
};

export default ManageOrders;