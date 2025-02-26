import { useState, useEffect } from "react"; // Import React hooks

/**
 * useOrderData Hook:
 * Manages fetching, creating, updating, and deleting orders. (Not in use yet)
 * Returns:
 * - orders: Array of orders.
 * - isLoading: Loading state.
 * - error: Error message (if any).
 * - createOrder: Function to create a new order.
 * - updateOrder: Function to update an existing order.
 * - deleteOrder: Function to delete an order.
 * - fetchOrders: Function to fetch orders from the API.
 */
interface Order {
  _id?: string;
  product: string;
  price: number;
  date: string;
}

const useOrderData = () => {
  const [orders, setOrders] = useState<Order[]>([]); // State for storing orders
  const [isLoading, setIsLoading] = useState(false); // State for loading status
  const [error, setError] = useState<string | null>(null); // State for error messages

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders from the API
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      const orderData = await response.json();
      setOrders(orderData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new order
  const createOrder = async (order: Omit<Order, '_id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      
      if (!response.ok) throw new Error("Failed to create order");
      await fetchOrders(); // Refresh the orders list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while creating order");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing order
  const updateOrder = async (order: Order) => {
    if (!order._id) return false;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      
      if (!response.ok) throw new Error("Failed to update order");
      await fetchOrders(); // Refresh the orders list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating order");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete an order
  const deleteOrder = async (order: Order) => {
    if (!order._id) return false;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error("Failed to delete order");
      await fetchOrders(); // Refresh the orders list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while deleting order");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orders,
    isLoading,
    error,
    createOrder,
    updateOrder,
    deleteOrder,
    fetchOrders
  };
};

export default useOrderData;
