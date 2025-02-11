import { IOrder } from '@/app/models/Order';
import { ICustomer } from '@/app/models/Customer';
import { IItem } from '@/app/models/Item';

// Function to fetch orders and update the state
export const fetchOrders = async (
  setOrders: React.Dispatch<React.SetStateAction<IOrder[]>>, // State setter for orders
  setLoading: React.Dispatch<React.SetStateAction<boolean>>, // State setter for loading indicator
  setError: React.Dispatch<React.SetStateAction<string | null>> // State setter for error message
) => {
  try {
    // Fetch orders from the API
    const response = await fetch('/api/orders');
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    const data: IOrder[] = await response.json(); 

    // Fetch additional data (customer and product details) for each order
    const updatedOrders = await Promise.all(
      data.map(async (order: IOrder) => {
        try {
          // Fetch customer data
          const customerResponse = await fetch(`/api/customers/${order.customer_id}`);
          if (!customerResponse.ok) throw new Error('Failed to fetch customer');
          const customerData: ICustomer = await customerResponse.json();

          // Fetch product data using product_items array
          const updatedProducts = await Promise.all(
            (order.product_items || []).map(async (productId) => {
              try {
                const productResponse = await fetch(`/api/items/${productId}`);
                if (!productResponse.ok) throw new Error('Failed to fetch product');
                const productData: IItem = await productResponse.json();

                // Find the quantity from the products array if it exists
                const quantity = order.products?.find(
                  p => p.product.toString() === productId.toString()
                )?.quantity || 1; // Default to 1 if not found

                return {
                  product: productData,
                  quantity: quantity
                };
              } catch (productErr) {
                console.error('Error fetching product data:', productErr);
                return {
                  product: null,
                  quantity: 0
                };
              }
            })
          );

          return {
            ...order,
            customer: customerData,
            products: updatedProducts.filter(p => p.product !== null)
          } as IOrder;
        } catch (err) {
          console.error('Error fetching order data:', err);
          return null;
        }
      })
    );

    // Update orders state with fetched data
    setOrders(updatedOrders.filter(order => order !== null));
  } catch (err) {
    console.error('Error fetching orders:', err);
    setError('Failed to load orders.');
  } finally {
    setLoading(false);
  }
};
