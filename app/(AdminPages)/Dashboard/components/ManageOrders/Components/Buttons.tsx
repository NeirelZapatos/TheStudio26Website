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
  selectedOrdersSize: number; // Number of selected orders
  selectedOrders: Set<string>; // Set of selected order IDs
  filterButtons: { label: string; value: OrderFilter; count: number }[]; // Filter buttons data
  activeFilter: OrderFilter; // Currently active filter
  setActiveFilter: (filter: OrderFilter) => void; // Function to set active filter
  handlePrintShippingLabels: () => void; // Function to print shipping labels
  handlePrintReceipt: () => void; // Function to print receipts
  handleMarkAsFulfilled: () => void; // Function to mark orders as fulfilled
  orders: IOrder[]; // Orders data
}> = ({
  selectedOrdersSize,
  filterButtons,
  activeFilter,
  setActiveFilter,
  handlePrintShippingLabels,
  handlePrintReceipt,
  handleMarkAsFulfilled,
  orders
}) => {
  const filterIcons: Record<OrderFilter, JSX.Element> = {
    [OrderFilter.PRIORITY]: <AlertCircle size={24} />, // Priority filter icon
    [OrderFilter.DELIVERIES]: <Truck size={24} />, // Deliveries filter icon
    [OrderFilter.PENDING]: <Clock size={24} />, // Pending filter icon
    [OrderFilter.PICKUP]: <Store size={24} />, // Pickup filter icon
    [OrderFilter.FULFILLED]: <CheckSquare size={24} />, // Fulfilled filter icon
    [OrderFilter.ALL]: <ShoppingBag size={24} />, // All orders filter icon

  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Section with Title and Export */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Manage Orders</h2> {/* Title */}
        <div className="flex gap-4">
          <button 
            onClick={() => exportOrdersToCSV(orders)} // Export orders to CSV
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
            onClick={handlePrintShippingLabels} // Print shipping labels
            disabled={selectedOrdersSize === 0} // Disable if no orders selected
            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg text-lg font-medium transition-colors ${
              selectedOrdersSize > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            🏷️ Print Shipping Labels ({selectedOrdersSize}) {/* Label and count */}
          </button>

          <button
            onClick={handlePrintReceipt} // Print receipts
            disabled={selectedOrdersSize === 0} // Disable if no orders selected
            className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg text-lg font-medium transition-colors ${
              selectedOrdersSize > 0
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Receipt size={24} />
            Print Receipt ({selectedOrdersSize}) {/* Label and count */}
          </button>
        </div>

        {/* Order Status Filters */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Filter Orders</h3> {/* Filter title */}
          <div className="grid grid-cols-3 gap-3">
            {filterButtons.map((button) => (
              <button
                key={button.value} // Unique key for each button
                onClick={() => setActiveFilter(button.value)} // Set active filter
                className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                  activeFilter === button.value
                    ? 'bg-blue-600 text-white' // Active filter style
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300' // Inactive filter style
                }`}
              >
                <div className="flex items-center gap-2">
                  {filterIcons[button.value]} {/* Filter icon */}
                  <span className="text-base font-medium">{button.label}</span> {/* Filter label */}
                </div>
                <span className={`text-sm mt-1 ${
                  activeFilter === button.value ? 'text-blue-100' : 'text-gray-500' // Count style
                }`}>
                  {button.count} orders {/* Filter count */}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleMarkAsFulfilled} // Mark orders as fulfilled
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
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
