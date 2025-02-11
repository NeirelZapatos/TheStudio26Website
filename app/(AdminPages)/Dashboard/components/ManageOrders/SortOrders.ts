import { IOrder } from '@/app/models/Order';
import { filterOrders } from './FilterOrders';

// SortOrders.ts
export enum OrderFilter {
  ALL = 'all',
  PENDING = 'pending',
  DELIVERIES = 'deliveries',
  FULFILLED = 'fulfilled',
  PICKUP = 'pickup',
  PRIORITY = 'priority'
}

export enum PriorityLevel {
  PICKUP = 1,
  URGENT = 2,
  NEXT_DAY = 3,
  EXPRESS = 4,
  PRIORITY = 5,
  STANDARD = 6,
  SHIPPED = 7,
  HIGH = 8,
  MEDIUM = 9,
  FULFILLED = 10,
  DELIVERED = 11
}

export const getOrderPriority = (order: IOrder): number => {
  const orderAge = (Date.now() - new Date(order.order_date).getTime()) / (1000 * 60 * 60 * 24);

  if (order.shipping_method === 'Pickup' && order.order_status === 'pending') {
    return PriorityLevel.PICKUP;
  }

  if (order.shipping_method === 'Express' && order.order_status === 'pending') {
    return PriorityLevel.EXPRESS;
  }

  if (order.shipping_method === 'Next Day' && order.order_status === 'pending') {
    return PriorityLevel.NEXT_DAY;
  }

  if (order.shipping_method === 'Priority' && order.order_status === 'pending') {
    return PriorityLevel.PRIORITY;
  }

  if (orderAge > 2 && 
      (order.shipping_method === 'Standard' || order.shipping_method === 'Ground') && 
      order.order_status === 'pending') {
    return PriorityLevel.URGENT;
  }

  switch (order.order_status) {
    case 'shipped': return PriorityLevel.SHIPPED;
    case 'fulfilled': return PriorityLevel.FULFILLED;
    case 'delivered': return PriorityLevel.DELIVERED;
    default: return PriorityLevel.MEDIUM;
  }
};

export const sortOrders = (
  orders: IOrder[],
  activeFilter: OrderFilter
): IOrder[] => {
  return orders.sort((a, b) => {
    if (activeFilter === OrderFilter.FULFILLED) {
      const statusPriority = {
        shipped: 1,
        fulfilled: 2,
        delivered: 3
      } as const;

      const getPriority = (status: string) => status in statusPriority 
        ? statusPriority[status as keyof typeof statusPriority]
        : Number.MAX_SAFE_INTEGER;

      const aPriority = getPriority(a.order_status);
      const bPriority = getPriority(b.order_status);

      if (aPriority !== bPriority) return aPriority - bPriority;
      
      // For shipped orders: newest first, others: oldest first
      if (a.order_status === 'shipped') {
        return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
      }
      return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
    }

    const aIsPickup = a.shipping_method === 'Pickup' && a.order_status === 'pending';
    const bIsPickup = b.shipping_method === 'Pickup' && b.order_status === 'pending';
    if (aIsPickup !== bIsPickup) return aIsPickup ? -1 : 1;

    const priorityA = getOrderPriority(a);
    const priorityB = getOrderPriority(b);
    if (priorityA !== priorityB) return priorityA - priorityB;

    return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
  });
};

export const SortOrders = (
  orders: IOrder[],
  activeFilter: OrderFilter,
  searchQuery: string
): IOrder[] => {
  const filteredOrders = filterOrders(orders, activeFilter, searchQuery);
  return sortOrders(filteredOrders, activeFilter);
};

export default SortOrders;