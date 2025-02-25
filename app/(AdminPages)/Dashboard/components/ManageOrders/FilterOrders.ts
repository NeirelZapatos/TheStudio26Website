import { IOrder } from '@/app/models/Order'; // Import IOrder interface
import { OrderFilter, PriorityLevel, getOrderPriority } from '@/utils/sortOrders'; // Import utilities

/**
 * getMatchScore:
 * Calculates a match score for an order based on how well it matches the search query.
 * 
 * @param order - The order object.
 * @param searchQuery - The search query.
 * @returns A score indicating the strength of the match.
 */

const getMatchScore = (order: IOrder, searchQuery: string): number => {
  if (!searchQuery) return 0; // Return 0 if no search query
  
  const fieldsToSearch = [
    order._id.toString().toLowerCase(), // Order ID
    `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.toLowerCase().trim(), // Customer name
    order.customer?.email?.toLowerCase() || '', // Customer email
    order.order_date ? new Date(order.order_date).toLocaleDateString('en-US').toLowerCase() : '', // Order date
    order.order_date ? new Date(order.order_date).toISOString().toLowerCase() : '' // Order date in ISO format
  ];

  let maxScore = 0;
  for (const field of fieldsToSearch) {
    const index = field.indexOf(searchQuery); // Find query in field
    if (index === 0) {
      maxScore = Math.max(maxScore, 3); // Exact start match
    } else if (index > 0) {
      maxScore = Math.max(maxScore, 2); // Contains match
    } else if (field.includes(searchQuery)) {
      maxScore = Math.max(maxScore, 1); // Partial match
    }
  }
  return maxScore; // Return match score
};

/**
 * filterOrders:
 * Filters and sorts orders based on the active filter and search query.
 * 
 * @param orders - Array of orders to filter.
 * @param activeFilter - The currently active filter.
 * @param searchQuery - The search query.
 * @returns A filtered and sorted array of orders.
 */

export const filterOrders = (
  orders: IOrder[], 
  activeFilter: OrderFilter, 
  searchQuery: string
): IOrder[] => {
  const query = searchQuery.toLowerCase().trim(); // Normalize search query
  
  const filtered = orders.filter(order => {
    // Exclude orders with invalid customers
    if (!order.customer?.first_name || !order.customer?.last_name) return false;

    const matchesSearch = query === '' || getMatchScore(order, query) > 0; // Check if order matches search

    switch (activeFilter) {
      case OrderFilter.PENDING:
        return matchesSearch && order.order_status === 'pending'; // Filter pending orders
      case OrderFilter.DELIVERIES:
        return matchesSearch && order.shipping_method !== 'Pickup' && order.order_status === 'pending'; // Filter delivery orders
      case OrderFilter.FULFILLED:
        return matchesSearch && ['shipped', 'fulfilled', 'delivered'].includes(order.order_status ?? ''); // Filter fulfilled orders
      case OrderFilter.PICKUP:
        return matchesSearch && order.shipping_method === 'Pickup' && order.order_status !== 'fulfilled'; // Filter pickup orders
      case OrderFilter.PRIORITY:
        const priority = getOrderPriority(order); // Get order priority
        return matchesSearch && [
          PriorityLevel.URGENT,
          PriorityLevel.NEXT_DAY,
          PriorityLevel.PICKUP,
          PriorityLevel.EXPRESS,
          PriorityLevel.PRIORITY
        ].includes(priority); // Filter priority orders
      default:
        return matchesSearch; // Return all matching orders
    }
  });

  // Sort by match quality then by priority
  return filtered.sort((a, b) => {
    const scoreA = getMatchScore(a, query); // Get match score for order A
    const scoreB = getMatchScore(b, query); // Get match score for order B
    if (scoreB !== scoreA) return scoreB - scoreA; // Sort by match score

    const priorityA = getOrderPriority(a); // Get priority for order A
    const priorityB = getOrderPriority(b); // Get priority for order B
    if (priorityA !== priorityB) return priorityB - priorityA; // Sort by priority

    return new Date(a.order_date).getTime() - new Date(b.order_date).getTime(); // Sort by order date
  });
};


