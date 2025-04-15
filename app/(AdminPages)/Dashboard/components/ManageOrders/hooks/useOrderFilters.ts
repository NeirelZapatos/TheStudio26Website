import { OrderFilter } from '@/utils/filterUtils/filterOrders';
import { IOrder } from '@/app/models/Order';

// In useOrderFilters.tsx - Fix the Priority button count calculation
export const useOrderFilters = (orders: IOrder[]) => {
  const filterButtons = [
    { 
      label: 'All Orders', 
      value: OrderFilter.ALL, 
      count: orders.length 
    },
    { 
      label: 'Pickup', 
      value: OrderFilter.PICKUP, 
      count: orders.filter((order: IOrder) => 
        order.shipping_method === 'pickup' && 
        order.order_status != 'fulfilled'
      ).length 
    },
    { 
      label: 'Priority', 
      value: OrderFilter.PRIORITY, 
      count: orders.filter((order: IOrder) => {
        const orderAge = (Date.now() - new Date(order.order_date).getTime()) / (1000 * 60 * 60 * 24);
        return (
          (order.shipping_method === 'pickup' && order.order_status === 'pending') ||
          (order.shipping_method !== 'pickup' && orderAge > 2 && order.order_status === 'pending')
        );
      }).length 
    },
    { 
      label: 'Pending', 
      value: OrderFilter.PENDING, 
      count: orders.filter((order: IOrder) => 
        order.shipping_method != 'delivery' &&
        order.order_status === 'pending' 
      ).length 
    },
    { 
      label: 'Deliveries', 
      value: OrderFilter.DELIVERY, 
      count: orders.filter((order: IOrder) => 
        order.shipping_method !== 'pickup' && 
        order.order_status === 'pending'
      ).length 
    },
    { 
      label: 'Fulfilled', 
      value: OrderFilter.FULFILLED, 
      count: orders.filter((order: IOrder) => 
        ['shipped', 'fulfilled', 'delivered'].includes(order.order_status ?? '')
      ).length 
    },
  ];

  return {
    filterButtons,
  };
};