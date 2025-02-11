import { IOrder } from '@/app/models/Order';
import { OrderFilter, PriorityLevel, getOrderPriority } from './SortOrders';

const getMatchScore = (order: IOrder, searchQuery: string): number => {
  if (!searchQuery) return 0;
  
  const fieldsToSearch = [
    order._id.toString().toLowerCase(),
    `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.toLowerCase().trim(),
    order.customer?.email?.toLowerCase() || '',
    order.order_date ? new Date(order.order_date).toLocaleDateString('en-US').toLowerCase() : '',
    order.order_date ? new Date(order.order_date).toISOString().toLowerCase() : ''
  ];

  let maxScore = 0;
  for (const field of fieldsToSearch) {
    const index = field.indexOf(searchQuery);
    if (index === 0) {
      maxScore = Math.max(maxScore, 3); // Exact start match
    } else if (index > 0) {
      maxScore = Math.max(maxScore, 2); // Contains match
    } else if (field.includes(searchQuery)) {
      maxScore = Math.max(maxScore, 1); // Partial match
    }
  }
  return maxScore;
};

export const filterOrders = (
  orders: IOrder[], 
  activeFilter: OrderFilter, 
  searchQuery: string
): IOrder[] => {
  const query = searchQuery.toLowerCase().trim();
  
  const filtered = orders.filter(order => {
    // Exclude orders with invalid customers
    if (!order.customer?.first_name || !order.customer?.last_name) return false;

    const matchesSearch = query === '' || getMatchScore(order, query) > 0;

    switch (activeFilter) {
      case OrderFilter.PENDING:
        return matchesSearch && order.order_status === 'pending';
      case OrderFilter.DELIVERIES:
        return matchesSearch && order.shipping_method !== 'Pickup' && order.order_status === 'pending';
      case OrderFilter.FULFILLED:
        return matchesSearch && ['shipped', 'fulfilled', 'delivered'].includes(order.order_status);
      case OrderFilter.PICKUP:
        return matchesSearch && order.shipping_method === 'Pickup' && order.order_status !== 'fulfilled';
      case OrderFilter.PRIORITY:
        const priority = getOrderPriority(order);
        return matchesSearch && [
          PriorityLevel.URGENT,
          PriorityLevel.NEXT_DAY,
          PriorityLevel.PICKUP,
          PriorityLevel.EXPRESS,
          PriorityLevel.PRIORITY
        ].includes(priority);
      default:
        return matchesSearch;
    }
  });

  // Sort by match quality then by priority
  return filtered.sort((a, b) => {
    const scoreA = getMatchScore(a, query);
    const scoreB = getMatchScore(b, query);
    if (scoreB !== scoreA) return scoreB - scoreA;

    const priorityA = getOrderPriority(a);
    const priorityB = getOrderPriority(b);
    if (priorityA !== priorityB) return priorityB - priorityA;

    return new Date(a.order_date).getTime() - new Date(b.order_date).getTime();
  });
};


