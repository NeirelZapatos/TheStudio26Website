import React from 'react';
import { IOrder } from '@/app/models/Order';
import { 
  Store, 
  Truck, 
  Calendar,
  Package,
  Clock,
  ShoppingBag,
} from 'lucide-react';

/**
 * OrderTables Component:
 * Displays a table of filtered orders with options to select, view details, and interact with individual orders.
 * 
 * Props:
 * - filteredOrders: Array of filtered orders to display.
 * - selectedOrders: Set of selected order IDs for bulk actions.
 * - expandedOrder: ID of the currently expanded order to show details.
 * - handleSelectAll: Function to select/deselect all orders.
 * - handleSelectOrder: Function to select/deselect an individual order.
 * - handleToggleDetails: Function to toggle the expanded view of an order's details.
 * - getTimeElapsed: Function to calculate the time elapsed since an order was placed.
 * - searchQuery: Current search query for highlighting matching text in the table.
 * 
 * Features:
 * - Displays customer name, order ID, shipping method, status, date, and item count for each order.
 * - Allows selection of individual or all orders via checkboxes.
 * - Highlights search query matches in customer names, order IDs, and other fields.
 * - Expands to show detailed order information, including customer details, shipping/billing addresses, and product details.
 * - Dynamically updates the UI based on the selected filter and search query.
 * 
 * Subcomponents:
 * None (This is a self-contained table component).
 * 
 * Utilities/Functions:
 * - getCustomerName: Extracts and formats the customer's full name from an order.
 * - highlightMatch: Highlights text matching the search query in the table.
 * - getOrderCount: Calculates the total number of items in an order.
 * 
 * Icons:
 * - Uses Lucide icons (Store, Truck, Calendar, Package, Clock, ShoppingBag) for visual representation of order details.
 * 
 * Styling:
 * - Uses Tailwind CSS for responsive and consistent styling.
 * - Highlights pending, shipped, and fulfilled orders with different background and text colors.
 * - Displays product images and details in a grid layout for expanded orders.
 * 
 * Interaction:
 * - Toggles between "View Details" and "Hide Details" for expanded order views.
 * - Supports bulk selection and deselection of orders.
 * - Dynamically updates the table based on the active filter and search query.
 */

// OrderTables Component: Displays filtered orders in a table with various actions
const OrderTables: React.FC<{
  filteredOrders: IOrder[];
  selectedOrders: Set<string>;
  expandedOrder: string | null;
  handleSelectAll: () => void;
  handleSelectOrder: (orderId: string) => void;
  handleToggleDetails: (orderId: string) => void;
  getTimeElapsed: (orderDate: string) => string;
  searchQuery: string;
}> = ({
  filteredOrders,
  selectedOrders,
  expandedOrder,
  handleSelectAll,
  handleSelectOrder,
  handleToggleDetails,
  getTimeElapsed,
  searchQuery
}) => {
  const getCustomerName = (order: IOrder): string => {
    if (!order.customer) return 'N/A';
    const firstName = order.customer.first_name || '';
    const lastName = order.customer.last_name || '';
    return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'N/A';
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-yellow-300 text-black">{part}</span>
      ) : (
        part
      )
    );
  };

  const getOrderCount = (order: IOrder): number => {
    return (order.products || []).reduce((sum, product) => {
      const quantity = product?.quantity || 0;
      return sum + quantity;
    }, 0);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-4 w-[50px]">
              <input
                type="checkbox"
                checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 w-4 h-4"
              />
            </th>
            <th className="p-4 text-left w-[300px]">Customer</th>
            <th className="p-4 text-left w-[80px]">Items</th>
            <th className="p-4 text-left w-[150px]">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Shipping Method
              </div>
            </th>
            <th className="p-4 text-left w-[120px]">Status</th>
            <th className="p-4 text-left w-[120px]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </div>
            </th>
            <th className="p-4 text-left w-[100px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order: IOrder) => (
            <React.Fragment key={order._id?.toString() ?? ''}>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order._id?.toString() ?? '')}
                    onChange={() => handleSelectOrder(order._id?.toString() ?? '')}
                    className="rounded border-gray-300 w-4 h-4"
                  />
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-2">
                      {highlightMatch(getCustomerName(order), searchQuery)}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {highlightMatch(order._id?.toString() ?? '', searchQuery)}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {highlightMatch(getTimeElapsed(order.order_date.toString()), searchQuery)}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-sm">{getOrderCount(order)}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {order.shipping_method === 'Pickup' ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
<span className="text-sm">{highlightMatch(order?.shipping_method ?? '', searchQuery)}</span>                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      order.order_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.order_status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {order.order_status}
                  </span>
                </td>
                <td className="p-4">
                  {highlightMatch(new Date(order.order_date).toLocaleDateString(), searchQuery)}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleDetails(order._id?.toString() ?? '')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {expandedOrder === order._id?.toString() ? 'Hide Details' : 'View Details'}
                  </button>
                </td>
              </tr>
              {expandedOrder === order._id?.toString() && (
                <tr>
                  <td colSpan={7} className="p-4 bg-gray-50">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Order Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><strong>Order ID:</strong> {order._id?.toString() ?? ''}</div>
                        <div><strong>Customer:</strong> {order.customer?.first_name} {order.customer?.last_name}</div>
                        <div><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</div>
                        <div><strong>Shipping Method:</strong> {order.shipping_method}</div>
                        <div><strong>Payment Method:</strong> {order.payment_method}</div>
                        <div><strong>Order Status:</strong> {order.order_status}</div>
                        <div className="col-span-2"><strong>Shipping Address:</strong> {order.shipping_address}</div>
                        <div className="col-span-2"><strong>Billing Address:</strong> {order.billing_address}</div>
                        <div><strong>Total Amount:</strong> ${order.total_amount}</div>
                      </div>
                      <div>
                        <strong>Items:</strong>
                        {(order.products || []).length > 0 && (
                          <ul className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(order.products || []).map((product, index) => (
                              <li key={index} className="p-4 bg-white rounded-lg shadow">
                                <div className="flex gap-4">
                                  <img
                                    src={product.product?.image_url}
                                    alt={product.product?.name}
                                    className="w-32 h-32 object-cover rounded"
                                  />
                                  <div>
                                    <div className="font-medium">{product.product?.name}</div>
                                    <div className="text-sm text-gray-600">{product.product?.description}</div>
                                    <div className="text-sm">Quantity: {product.quantity}</div>
                                    <div className="text-sm text-gray-500">Price: ${product.product?.price}</div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTables;