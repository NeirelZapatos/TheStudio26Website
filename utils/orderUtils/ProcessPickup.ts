import { IOrder } from "@/app/models/Order";

// Updated MutateFunction type
type MutateFunction = (
  data?: IOrder[] | Promise<IOrder[]> | ((currentData: IOrder[] | undefined) => IOrder[] | undefined),
  shouldRevalidate?: boolean
) => Promise<IOrder[] | undefined>;

export const ProcessPickup = async (
  orderIds: string[],
  orderStatus: string,
  mutate: MutateFunction // Use the updated MutateFunction type
): Promise<IOrder[]> => {
  try {
    // Step 1: Update the order_status for the selected orders
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

    // Get the updated data from the response
    const updatedOrdersData = await updateResponse.json();
    
    // Step 2: Use optimistic update pattern with SWR's mutate
    await mutate(
      (currentOrders: IOrder[] | undefined) => {
        if (!currentOrders) return [];
        
        return currentOrders.map((order: IOrder) => {
          if (orderIds.includes(order._id.toString())) {
            return {
              ...order,
              order_status: orderStatus
            } as IOrder; // Explicitly assert the type as IOrder
          }
          return order;
        });
      },
      false // Avoid immediate revalidation
    );
    
    // Step 3: Trigger a background revalidation
    setTimeout(() => {
      mutate();
    }, 300);

    return updatedOrdersData;
  } catch (error) {
    console.error('Failed to process pickup:', error);
    throw new Error('Failed to process pickup');
  }
};