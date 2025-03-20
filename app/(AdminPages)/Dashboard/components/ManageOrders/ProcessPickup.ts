export const ProcessPickup = async (
  orderIds: string[],
  orderStatus: string,
  mutate: (data?: IOrder[] | Promise<IOrder[]>, shouldRevalidate?: boolean) => Promise<IOrder[] | undefined>
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
    // This updates the local data immediately without waiting for revalidation
    await mutate(
      (currentOrders) => {
        if (!currentOrders) return [];
        
        // Create a new array with updated orders
        return currentOrders.map(order => {
          if (orderIds.includes(order._id.toString())) {
            return {
              ...order,
              order_status: orderStatus
            };
          }
          return order;
        });
      }, 
      false // Set to false to avoid immediate revalidation (which causes the flicker)
    );
    
    // Step 3: Then trigger a background revalidation to ensure data consistency
    setTimeout(() => {
      mutate();
    }, 300);

    return updatedOrdersData;
  } catch (error) {
    console.error('Failed to process pickup:', error);
    throw new Error('Failed to process pickup');
  }
};