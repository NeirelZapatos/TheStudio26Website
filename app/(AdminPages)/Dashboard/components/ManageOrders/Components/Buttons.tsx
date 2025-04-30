import { CheckCircle, CheckSquare, DownloadIcon, Receipt, ShoppingBag, Truck, Clock, AlertCircle, Store } from "lucide-react"; // Import icons
import exportOrdersToCSV from '@/utils/docUtils/ExportReport'; // Import exportOrdersToCSV utility
import { IOrder } from "@/app/models/Order"; // Import IOrder interface
import { OrderFilter } from'@/utils/filterUtils/filterOrders'; // Import OrderFilter enum

/**
 * Buttons Component:
 * Provides action buttons for managing orders, including exporting, printing labels, and filtering.
 * 
 * Props:
 * - selectedOrdersSize: Number of selected orders.
 * - selectedOrders: Set of selected order IDs.
 * - filterButtons: Array of filter button configurations.
 * - activeFilter: Currently active filter.
 * - setActiveFilter: Function to set the active filter.
 * - handlePrintShippingLabels: Function to print shipping labels.
 * - handlePrintReceipt: Function to print receipts.
 * - handleMarkAsFulfilled: Function to mark orders as fulfilled.
 * - orders: Array of orders.
 */

const Buttons: React.FC<{
  selectedOrdersSize: number;
  selectedOrders: Set<string>;
  filterButtons: { label: string; value: OrderFilter; count: number }[];
  activeFilter: OrderFilter;
  setActiveFilter: (filter: OrderFilter) => void;
  handlePrintShippingLabels: () => void;
  handlePrintReceipt: () => void;
  handleMarkAsFulfilled: () => void;
  orders: IOrder[];
  hasOnlyPickupOrders: () => boolean;
  hasDeliveryOrders: () => boolean;
}> = ({
  selectedOrdersSize,
  filterButtons,
  activeFilter,
  setActiveFilter,
  handlePrintShippingLabels,
  handlePrintReceipt,
  handleMarkAsFulfilled,
  orders,
  hasOnlyPickupOrders,
  hasDeliveryOrders
}) => {
  const filterIcons: Record<OrderFilter, JSX.Element> = {
    [OrderFilter.PRIORITY]: <AlertCircle size={24} />,
    [OrderFilter.DELIVERY]: <Truck size={24} />, // Changed from DELIVERIES to DELIVERY
    [OrderFilter.PENDING]: <Clock size={24} />,
    [OrderFilter.PICKUP]: <Store size={24} />,
    [OrderFilter.FULFILLED]: <CheckSquare size={24} />,
    [OrderFilter.ALL]: <ShoppingBag size={24} />,
  };

  // Check conditions for button activation
  const canPrintShippingLabels = selectedOrdersSize > 0 && hasDeliveryOrders();
  const canMarkAsFulfilled = selectedOrdersSize > 0 && hasOnlyPickupOrders();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Section with Title and Export */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Orders</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => exportOrdersToCSV(orders)}
            className="flex items-center gap-2 px-6 py-3 bg-lightBlue-400 text-gray-700 rounded-lg hover:bg-lightBlue-500 transition-colors font-medium text-lg"
          >
            <DownloadIcon /> Export Orders
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Primary Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handlePrintShippingLabels}
            disabled={!canPrintShippingLabels}
            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg text-lg font-medium transition-colors ${
              canPrintShippingLabels
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            🏷️ Print Shipping Labels ({selectedOrdersSize})
          </button>

          <button
            onClick={handlePrintReceipt}
            disabled={selectedOrdersSize === 0}
            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg text-lg font-medium transition-colors ${
              selectedOrdersSize > 0
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Receipt size={24} />
            Print Receipt ({selectedOrdersSize})
          </button>
        </div>

        {/* Order Status Filters */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter Orders</h3>
          <div className="grid grid-cols-3 gap-3">
            {filterButtons.map((button) => (
              <button
                key={button.value}
                onClick={() => setActiveFilter(button.value)}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  activeFilter === button.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {filterIcons[button.value]}
                  <span className="text-base font-medium">{button.label}</span>
                </div>
                <span className={`text-sm mt-1 ${
                  activeFilter === button.value ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {button.count} orders
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleMarkAsFulfilled}
            disabled={!canMarkAsFulfilled}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium text-lg ${
              canMarkAsFulfilled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle size={24} />
            Mark as Fulfilled
          </button>
        </div>
      </div>
    </div>
  );
};

export default Buttons;