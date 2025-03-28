import { OrderFilter } from '@/utils/filterUtils/filterOrders';
import { IOrder } from '@/app/models/Order';

export const useOrderFilters = (validOrders: IOrder[]) => {
  const filterButtons = [
    { 
      label: 'All Orders', 
      value: OrderFilter.ALL, 
      count: validOrders.length 
    },
    { 
      label: 'Pickup', 
      value: OrderFilter.PICKUP, 
      count: validOrders.filter((order: IOrder) => 
        order.shipping_method === 'Pickup' && 
        order.order_status !== 'fulfilled'
      ).length 
    },
    { 
      label: 'Priority', 
      value: OrderFilter.PRIORITY, 
      count: validOrders.filter((order: IOrder) => {
        const orderAge = (Date.now() - new Date(order.order_date).getTime()) / (1000 * 60 * 60 * 24);
        return (
          order.order_status === 'pending' &&
          (order.shipping_method === 'Express' ||
            order.shipping_method === 'Next Day' ||
            order.shipping_method === 'Priority' ||
            ((order.shipping_method === 'Standard' || order.shipping_method === 'Ground') &&
              orderAge > 3))
        );
      }).length 
    },
    { 
      label: 'Pending', 
      value: OrderFilter.PENDING, 
      count: validOrders.filter((order: IOrder) => 
        order.order_status === 'pending'
      ).length 
    },
    { 
      label: 'Deliveries', 
      value: OrderFilter.DELIVERIES, 
      count: validOrders.filter((order: IOrder) => 
        order.shipping_method !== 'Pickup' && 
        order.order_status === 'pending'
      ).length 
    },
    { 
      label: 'Fulfilled', 
      value: OrderFilter.FULFILLED, 
      count: validOrders.filter((order: IOrder) => 
        ['shipped', 'fulfilled', 'delivered'].includes(order.order_status ?? '')
      ).length 
    },
  ];

  return {
    filterButtons,
  };
};

export default OrderFilter;