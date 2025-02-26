import { IOrder } from '@/app/models/Order'; // Import the IOrder interface from the Order model

// Fetch a single order by ID
export const fetchOrder = async (orderId: string): Promise<IOrder> => {
  const response = await fetch(`/api/orders/${orderId}`); // Fetch order data from the API
  if (!response.ok) throw new Error(`Failed to fetch order: ${orderId}`); // Throw an error if the response is not OK
  return response.json(); // Return the parsed JSON response
};