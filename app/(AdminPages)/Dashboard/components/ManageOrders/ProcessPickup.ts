import { IOrder } from '@/app/models/Order'; // Import IOrder interface

// ProcessPickup function: Updates order status and revalidates data
export const ProcessPickup = async (
  orderIds: string[], // Array of order IDs to update
  orderStatus: string, // New status (e.g., 'fulfilled')
  mutate: (data?: IOrder[] | Promise<IOrder[]>, shouldRevalidate?: boolean) => Promise<IOrder[] | undefined> // SWR mutate function
): Promise<IOrder[]> => {
  try {
    // Step 1: Update the order_status for the selected orders
    const updateResponse = await fetch('/api/orders', {
      method: 'PUT', // Use PUT to update the orders
      headers: {
        'Content-Type': 'application/json', // Set content type to JSON
      },
      body: JSON.stringify({ orderIds, order_status: orderStatus }), // Send order IDs and new status
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update order status'); // Throw error if update fails
    }

    // Step 2: Fetch the updated orders from the database
    const fetchResponse = await fetch('/api/orders'); // Fetch updated orders
    if (!fetchResponse.ok) {
      throw new Error('Failed to fetch updated orders'); // Throw error if fetch fails
    }

    const updatedOrders: IOrder[] = await fetchResponse.json(); // Parse updated orders

    // Step 3: Update the state with the new orders using SWR's mutate
    await mutate(updatedOrders, true); // Revalidate the data

    // Return the updated orders
    return updatedOrders;
  } catch (error) {
    console.error('Failed to process pickup:', error); // Log error
    throw new Error('Failed to process pickup'); // Throw error
  }
};

export default ProcessPickup; // Export ProcessPickup function
