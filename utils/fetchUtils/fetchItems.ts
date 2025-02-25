import { fetchItem } from './fetchItem'; // Import the fetchItem utility function
import { IItem } from '@/app/models/Item'; // Import the IItem interface from the Item model

export interface EnrichedProduct {
  product: IItem; // Define the product property
  quantity: number; // Define the quantity property
}

// Fetch items for an order
export const fetchItems = async (productIds: string[], orderProducts: any[]): Promise<EnrichedProduct[]> => {
  const products = await Promise.all(
    productIds.map(async (productId) => {
      // Fetch the item
      const product = await fetchItem(productId); // Fetch product details

      // Get the quantity from the orderProducts array
      const quantity =
        orderProducts.find((p) => p.product.toString() === productId.toString())?.quantity || 1; // Get product quantity

      // Return the enriched product with its quantity
      return { product, quantity };
    })
  );

  // Filter out any null products
  return products.filter((p) => p.product !== null);
};