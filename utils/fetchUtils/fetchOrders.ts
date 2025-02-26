import { IOrder } from '@/app/models/Order'; // Import the IOrder interface from the Order model
import { ICourse } from '@/app/models/Course'; // Import the ICourse interface from the Course model
import { Types } from 'mongoose'; // Import Types from mongoose for ObjectId handling
import { fetchCustomer } from '@/utils/fetchUtils/fetchCustomer'; // Import utility to fetch customer data
import { fetchItem } from '@/utils/fetchUtils/fetchItem'; // Import utility to fetch item data
import { fetchCourse } from '@/utils/fetchUtils/fetchCourse'; // Import utility to fetch course data

// Generic fetcher utility function to fetch data from a given URL
const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url); // Fetch data from the URL
  if (!response.ok) throw new Error(`Failed to fetch: ${url}`); // Throw an error if the response is not OK
  return response.json(); // Return the parsed JSON response
};

// Fetch orders and enrich them with related customer, product, and course data
export const fetchOrders = async (url: string) => {
  const orders = await fetcher<IOrder[]>(url); // Fetch orders from the provided URL

  const enrichedOrders = await Promise.all(
    orders.map(async (order) => {
      try {
        // Fetch customer data if customer_id exists
        const customer = order?.customer_id ? await fetchCustomer(order.customer_id.toString()) : null;

        // Fetch product items and their quantities
        const products = await Promise.all(
          (order.product_items || []).map(async (productId) => {
            const product = await fetchItem(productId.toString()); // Fetch product details
            const quantity =
              order.products?.find((p) => p.product.toString() === productId.toString())?.quantity || 1; // Get product quantity
            return { product, quantity }; // Return product and quantity
          })
        );

        // Fetch course items
        const courses = await Promise.all(
          (order.course_items || []).map(async (courseId: Types.ObjectId) => {
            return fetchCourse(courseId.toString()); // Fetch course details
          })
        );

        // Return the enriched order with customer, products, and courses
        return {
          ...order,
          customer,
          products: products.filter((p) => p.product !== null), // Filter out null products
          course_items: courses.filter((c): c is ICourse => c !== null), // Filter out null courses
        } as IOrder & { course_items: ICourse[] }; // Extend IOrder with enriched course data
      } catch (error) {
        console.error("Error enriching order:", error); // Log any errors during enrichment
        return null; // Return null for failed enrichments
      }
    })
  );

  // Filter out any null orders and return the enriched orders
  return enrichedOrders.filter((order) => order !== null);
}