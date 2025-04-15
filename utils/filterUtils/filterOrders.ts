import { IOrder } from '@/app/models/Order';

export enum OrderFilter {
  ALL = 'all',
  PICKUP = 'pickup', 
  PRIORITY = 'priority',
  PENDING = 'pending',
  DELIVERY = 'delivery',
  FULFILLED = 'fulfilled'
}

export const filterOrders = (orders: IOrder[], filter: OrderFilter): IOrder[] => {
  switch (filter) {
    case OrderFilter.ALL:
      return orders;
    
    case OrderFilter.PICKUP:
      return orders.filter(order => 
        order.shipping_method === 'pickup' && 
        order.order_status !== 'fulfilled'
      );
    
    case OrderFilter.PRIORITY:
      return orders.filter((order) => {
        const orderAge = (Date.now() - new Date(order.order_date).getTime()) / (1000 * 60 * 60 * 24);
        return (
          (order.shipping_method === 'pickup' && order.order_status === 'pending') ||
          (order.shipping_method !== 'pickup' && orderAge > 2 && order.order_status === 'pending')
        );
      });
    
    case OrderFilter.PENDING:
      return orders.filter(order => 
        order.order_status === 'pending'
      );
    
    case OrderFilter.DELIVERY:
      return orders.filter(order => 
        order.shipping_method != 'pickup' && 
        order.order_status === 'pending'
      );
    
    case OrderFilter.FULFILLED:
      return orders.filter(order => 
        ['shipped', 'fulfilled', 'delivered'].includes(order.order_status ?? '')
      );
    
    default:
      return orders;
  }
};