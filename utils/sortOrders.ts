import { IOrder } from '@/app/models/Order'; // Import the IOrder interface from the Order model
import { filterOrders } from '../app/(AdminPages)/Dashboard/components/ManageOrders/FilterOrders'; // Import the filterOrders utility function

// SortOrders.ts
export enum OrderFilter {
  ALL = 'all', // Filter for all orders
  PENDING = 'pending', // Filter for pending orders
  DELIVERIES = 'deliveries', // Filter for delivery orders
  FULFILLED = 'fulfilled', // Filter for fulfilled orders
  PICKUP = 'pickup', // Filter for pickup orders
  PRIORITY = 'priority', // Filter for priority orders
  SHIPPED = 'shipped', // Filter for shipped orders
  DELIVERED = 'delivered' // Filter for delivered orders
}

export enum PriorityLevel {
  PICKUP = 1, // Priority level for pickup orders
  URGENT = 2, // Priority level for urgent orders
  NEXT_DAY = 3, // Priority level for next-day orders
  EXPRESS = 4, // Priority level for express orders
  PRIORITY = 5, // Priority level for priority orders
  STANDARD = 6, // Priority level for standard orders
  SHIPPED = 7, // Priority level for shipped orders
  HIGH = 8, // Priority level for high-priority orders
  MEDIUM = 9, // Priority level for medium-priority orders
  FULFILLED = 10, // Priority level for fulfilled orders
  DELIVERED = 11 // Priority level for delivered orders
}

// Get the priority level for an order based on its status and shipping method
export const getOrderPriority = (order: IOrder): number => {
  const orderAge = (Date.now() - new Date(order.order_date).getTime()) / (1000 * 60 * 60 * 24); // Calculate the age of the order in days

  if (order.shipping_method === 'Pickup' && order.order_status === 'pending') {
    return PriorityLevel.PICKUP; // Return pickup priority for pending pickup orders
  }

  if (order.shipping_method === 'Express' && order.order_status === 'pending') {
    return PriorityLevel.EXPRESS; // Return express priority for pending express orders
  }

  if (order.shipping_method === 'Next Day' && order.order_status === 'pending') {
    return PriorityLevel.NEXT_DAY; // Return next-day priority for pending next-day orders
  }

  if (order.shipping_method === 'Priority' && order.order_status === 'pending') {
    return PriorityLevel.PRIORITY; // Return priority for pending priority orders
  }

  if (orderAge > 2 && 
      (order.shipping_method === 'Standard' || order.shipping_method === 'Ground') && 
      order.order_status === 'pending') {
    return PriorityLevel.URGENT; // Return urgent priority for old pending standard/ground orders
  }

  switch (order.order_status ?? '') {
    case 'shipped': return PriorityLevel.SHIPPED; // Return shipped priority for shipped orders
    case 'fulfilled': return PriorityLevel.FULFILLED; // Return fulfilled priority for fulfilled orders
    case 'delivered': return PriorityLevel.DELIVERED; // Return delivered priority for delivered orders
    default: return PriorityLevel.MEDIUM; // Return medium priority for all other orders
  }
};

// Sort orders based on the active filter
export const sortOrders = (
  orders: IOrder[],
  activeFilter: OrderFilter
): IOrder[] => {
  return orders.sort((a, b) => {
    if (activeFilter === OrderFilter.FULFILLED) {
      const statusPriority = {
        shipped: 1, // Priority for shipped orders
        fulfilled: 2, // Priority for fulfilled orders
        delivered: 3 // Priority for delivered orders
      } as const;

      const getPriority = (status: string) => status in statusPriority 
      ? statusPriority[status as keyof typeof statusPriority]
      : Number.MAX_SAFE_INTEGER; // Get priority for a given status
    
    const aPriority = getPriority(a.order_status ?? ''); // Get priority for order A
    const bPriority = getPriority(b.order_status ?? ''); // Get priority for order B

      if (aPriority !== bPriority) return aPriority - bPriority; // Sort by priority if priorities differ
      
      // For shipped orders: newest first, others: oldest first
      if (a.order_status === 'shipped') {
        return new Date(b.order_date).getTime() - new Date(a.order_date).getTime(); // Sort shipped orders by newest first
      }
      return new Date(a.order_date).getTime() - new Date(b.order_date).getTime(); // Sort other orders by oldest first
    }

    const aIsPickup = a.shipping_method === 'Pickup' && a.order_status === 'pending'; // Check if order A is a pending pickup order
    const bIsPickup = b.shipping_method === 'Pickup' && b.order_status === 'pending'; // Check if order B is a pending pickup order
    if (aIsPickup !== bIsPickup) return aIsPickup ? -1 : 1; // Sort pickup orders first

    const priorityA = getOrderPriority(a); // Get priority for order A
    const priorityB = getOrderPriority(b); // Get priority for order B
    if (priorityA !== priorityB) return priorityA - priorityB; // Sort by priority if priorities differ

    return new Date(a.order_date).getTime() - new Date(b.order_date).getTime(); // Sort by order date
  });
};

// Sort orders based on the active filter and search query
export const SortOrders = (
  orders: IOrder[],
  activeFilter: OrderFilter,
  searchQuery: string
): IOrder[] => {
  const filteredOrders = filterOrders(orders, activeFilter, searchQuery); // Filter orders based on the active filter and search query
  return sortOrders(filteredOrders, activeFilter); // Sort the filtered orders
};

export default SortOrders; // Export the SortOrders function