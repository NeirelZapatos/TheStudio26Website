import { IOrder } from "@/app/models/Order";

// Updated MutateFunction type
type MutateFunction = (
  data?: IOrder[] | Promise<IOrder[]> | ((currentData: IOrder[] | undefined) => IOrder[] | undefined),
  shouldRevalidate?: boolean
) => Promise<IOrder[] | undefined>;

export const ProcessPickup = async (
  orderIds: string[],
  orderStatus: string,
  mutate: MutateFunction
): Promise<IOrder[]> => {
  try {
    const updateResponse = await fetch('/api/orders', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderIds, order_status: orderStatus }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update order status');
    }

    const updatedOrdersData = await updateResponse.json();

    await mutate(
      (currentOrders: IOrder[] | undefined) => {
        if (!currentOrders) return [];
        return currentOrders.map((order: IOrder) => {
          if (orderIds.includes(order._id.toString())) {
            return {
              ...order,
              order_status: orderStatus
            } as IOrder;
          }
          return order;
        });
      },
      false
    );

    setTimeout(() => {
      mutate();
    }, 300);

    window.alert("Order has printed successfully.");

    return updatedOrdersData;
  } catch (error) {
    console.error('Failed to process pickup:', error);
    throw new Error('Failed to process pickup');
  }
};
