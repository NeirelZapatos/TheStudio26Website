import React, { useState } from 'react';
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
 * Determines if an order is a pickup order by checking the delivery_method or is_pickup fields
 * @param {IOrder} order - The order to check
 * @returns {boolean} - True if the order is considered pickup
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
 * Resolves shipping method strings into standardized display values based on the order type.
 * @param {IOrder} order - The complete order object
 * @returns {string} - The standardized shipping method display value
 */
const resolveShippingMethod = (order: IOrder): string => {
  // First check if it's a class booking
  if (order.order_type === 'class_booking') {
    return 'Class Booking';
  }
  
  // Then check if it's a pickup order
  if (isPickupOrder(order)) {
    return 'Pickup';
  }
  
  // Default to delivery
  return 'Delivery';
};

/**
 * Order Tables Component:
 * Displays a table of orders with expandable details
 */
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
  searchQuery,
}) => {
  const getCustomerName = (order: IOrder): string => {
    if (!order.customer) return 'N/A';
    const firstName = order.customer.first_name || '';
    const lastName = order.customer.last_name || '';
    return firstName || lastName ? `${firstName} ${lastName}`.trim() : 'N/A';
  };

  const getOrderCount = (order: IOrder): number => {
    return (order.products || []).reduce((sum, product) => {
      const quantity = product?.quantity || 0;
      return sum + quantity;
    }, 0);
  };

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500">
            {selectedOrders.size} of {filteredOrders.length} orders selected
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 w-[50px]">
                <input
                  type="checkbox"
                  aria-label="Select all orders"
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
              <th className="p-4 text-left w-[200px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order: IOrder) => {
              // Pre-process the shipping method for display
              const displayShippingMethod = resolveShippingMethod(order);
              const isPickup = isPickupOrder(order);
              
              return (
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
                          {getCustomerName(order)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {order._id?.toString() ?? ''}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeElapsed(order.order_date.toString())}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{getOrderCount(order)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {isPickup ? (
                          <Store className="w-4 h-4" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                        <span className="text-sm">{displayShippingMethod}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          order.order_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.order_status === 'shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : order.order_status === 'fulfilled'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.order_status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleDetails(order._id?.toString() ?? '')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedOrder === order._id?.toString() ? 'Hide Details' : 'View Details'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrder === order._id?.toString() && (
                    <tr>
                      <td colSpan={7} className="p-4 bg-gray-50">
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">Order Details</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><strong>Order ID:</strong> {order._id?.toString() ?? ''}</div>
                            <div><strong>Customer:</strong> {order.customer?.first_name} {order.customer?.last_name}</div>
                            <div><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</div>
                            <div><strong>Shipping Method:</strong> {displayShippingMethod}</div>
                            <div><strong>Payment Method:</strong> {order.payment_method}</div>
                            <div className="col-span-2"><strong>Shipping Address:</strong> {order.shipping_address}</div>
                            <div className="col-span-2"><strong>Billing Address:</strong> {order.billing_address}</div>
                            <div className="col-span-2"><strong>Total Amount:</strong> ${order.total_amount}</div>
                          </div>
                          
                          <div className="mt-6">
                            <h4 className="text-lg font-semibold mb-4">Items</h4>
                            {(order.products || []).length > 0 && (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {(() => {
                                  interface UniqueProductEntry {
                                    product: any;
                                    quantity: number;
                                    displayData: any;
                                  }
                                  
                                  const uniqueProducts: Record<string, UniqueProductEntry> = {};
                                  
                                  (order.products || []).forEach((product) => {
                                    const productId = product.product?._id?.toString() || 'unknown';
                                    
                                    if (!uniqueProducts[productId]) {
                                      uniqueProducts[productId] = {
                                        product: product.product,
                                        quantity: 0,
                                        displayData: product
                                      };
                                    }
                                    
                                    uniqueProducts[productId].quantity += product.quantity || 0;
                                  });
                                  
                                  return Object.values(uniqueProducts).map((item, index) => (
                                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                                      <div className="flex flex-col sm:flex-row gap-4">
                                        <img
                                          src={item.product?.image_url || '/api/placeholder/100/100'}
                                          alt={item.product?.name}
                                          className="w-32 h-32 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                          <div className="font-medium text-lg">{item.product?.name}</div>
                                          <div className="text-sm text-gray-600 mt-1">{item.product?.description}</div>
                                          <div className="mt-2 text-sm font-medium">Quantity: {item.quantity}</div>
                                          <div className="text-sm text-gray-700">Price: ${item.product?.price}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderTables;