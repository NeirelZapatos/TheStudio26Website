import { IOrder } from '@/app/models/Order'; // Import the IOrder interface from the Order model

// SortOrders.ts
export enum OrderFilter {
  ALL = 'all', // Filter for all orders
  PENDING = 'pending', // Filter for pending orders
  DELIVERY = 'delivery', // Filter for delivery orders
  FULFILLED = 'fulfilled', // Filter for fulfilled orders
  PICKUP = 'pickup', // Filter for pickup orders
  PRIORITY = 'priority', // Filter for priority orders
  SHIPPED = 'shipped', // Filter for shipped orders
  DELIVERED = 'delivered' // Filter for delivered orders
}

export enum PriorityLevel {
  PICKUP = 1, // Priority level for pickup orders (highest priority)
  URGENT_DELIVERY = 2, // Priority level for urgent next-day orders
  DELIVERY = 3, // Priority level for urgent express orders
  SHIPPED = 4, // Priority level for shipped orders
  FULFILLED = 5, // Priority level for fulfilled orders
  DELIVERED = 6 // Priority level for delivered orders (lowest priority)
}

// Get the priority level for an order based on its status and shipping method
export const getOrderPriority = (order: IOrder): number => {
  const orderAge = (Date.now() - new Date(order.order_date).getTime()) / (1000 * 60 * 60 * 24); // Calculate the age of the order in days
  const isPending = order.order_status === 'pending';
  const isUrgent = orderAge > 1; // Order is urgent if waiting more than 1 day

  // Always prioritize pickup orders at the top
  if (order.shipping_method === 'pickup' && isPending) {
    return PriorityLevel.PICKUP;
  }

  // For pending orders, prioritize based on shipping method and age
  if (isPending) {
    // Urgent orders (waiting more than 1 day) - maintain shipping method hierarchy
    if (isUrgent) {
      if (order.shipping_method === 'delivery') return PriorityLevel.URGENT_DELIVERY;
      return PriorityLevel.URGENT_DELIVERY; // Standard, Ground, or any other shipping method
    }
    
    // Normal priority orders (less than 1 day old)
    if (order.shipping_method === 'delivery') return PriorityLevel.DELIVERY;
    return PriorityLevel.DELIVERY; // Standard, Ground, or any other shipping method
  }

  // Non-pending orders go to the bottom with their own hierarchy
  switch (order.order_status ?? '') {
    case 'shipped': return PriorityLevel.SHIPPED;
    case 'fulfilled': return PriorityLevel.FULFILLED;
    case 'delivered': return PriorityLevel.DELIVERED;
    default: return PriorityLevel.DELIVERY; // Fallback for any other status
  }
};

// Sort orders based on the active filter
export const sortOrders = (
  orders: IOrder[],
  activeFilter: OrderFilter
): IOrder[] => {
  return orders.sort((a, b) => {
    // Special case for fulfilled filter
    if (activeFilter === OrderFilter.FULFILLED) {
      const statusPriority = {
        shipped: 1,
        fulfilled: 2,
        delivered: 3
      } as const;

      const getPriority = (status: string) => status in statusPriority 
        ? statusPriority[status as keyof typeof statusPriority]
        : Number.MAX_SAFE_INTEGER;
      
      const aPriority = getPriority(a.order_status ?? '');
      const bPriority = getPriority(b.order_status ?? '');

      if (aPriority !== bPriority) return aPriority - bPriority;
      
      // For shipped orders: newest first, others: oldest first
      if (a.order_status === 'shipped') {
        return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
      }
      return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
    }

    // For all other filters, use the priority system
    const priorityA = getOrderPriority(a);
    const priorityB = getOrderPriority(b);
    
    // If priorities are different, sort by priority
    if (priorityA !== priorityB) return priorityA - priorityB;
    
    // If priorities are the same, sort by age (oldest first)
    return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
  });
};

// Sort orders based on the active filter
export const SortOrders = (
  orders: IOrder[],
  activeFilter: OrderFilter
): IOrder[] => {
  return sortOrders(orders, activeFilter); // Sort the orders based on the active filter
};

export default SortOrders; // Export the SortOrders function