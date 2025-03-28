import React, { useMemo } from 'react';
/**
 * OrderItem Component:
 * Displays details of a single order, including order ID, date, status, total amount, and purchased items.
 * 
 * Props:
 * - order: The order object containing details like ID, date, status, total amount, and items.
 * - orderCategory: A string indicating the category of the order ("all", "classes", or "products").
 */

interface OrderItemProps {
  order: any; // The order object containing details
  orderCategory: "all" | "classes" | "products"; // Category of the order
}

/**
 * OrderItem Functional Component:
 * Renders the order details and conditionally displays purchased courses or products based on the order category.
 */
const OrderItem: React.FC<OrderItemProps> = ({ order, orderCategory }) => {
  // Consolidate course items using useMemo to prevent re-counting on re-renders
  const consolidatedCourses = useMemo(() => {
    if (orderCategory === "products") return [];

    const courseMap = new Map<string, { name: string, price: number, count: number }>();
    
    order.course_items?.forEach((course: any) => {
      const existingCourse = courseMap.get(course.name);
      if (existingCourse) {
        existingCourse.count += 1;
      } else {
        courseMap.set(course.name, { ...course, count: 1 });
      }
    });

    return Array.from(courseMap.values());
  }, [order.course_items, orderCategory]);

  // Consolidate product items using useMemo
  const consolidatedProducts = useMemo(() => {
    if (orderCategory === "classes") return [];

    const productMap = new Map<string, any>();
    
    order.products?.forEach((item: any) => {
      const existingProduct = productMap.get(item.product.name);
      if (existingProduct) {
        existingProduct.quantity += item.quantity;
      } else {
        productMap.set(item.product.name, { ...item });
      }
    });

    return Array.from(productMap.values());
  }, [order.products, orderCategory]);

  return (
    <li className="mb-4 border p-3 rounded-md bg-gray-100">
      {/* Display basic order details */}
      <p><strong>Order ID:</strong> {order._id}</p>
      <p><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
      <p><strong>Status:</strong> {order.order_status}</p>
      <p><strong>Total Amount:</strong> ${order.total_amount?.toFixed(2)}</p>

      {/* Render purchased courses if the order category is not "products" */}
      {orderCategory !== "products" && consolidatedCourses?.length > 0 && (
        <div className="mt-2">
          <strong>Courses Purchased:</strong>
          <ul className="list-disc pl-4">
            {consolidatedCourses.map((course: any, index: number) => (
              <li key={index}>
                {course.name} (x{course.count}) - ${parseFloat(course.price).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Render purchased products if the order category is not "classes" */}
      {orderCategory !== "classes" && consolidatedProducts?.length > 0 && (
        <div className="mt-2">
          <strong>Products Purchased:</strong>
          <ul className="list-disc pl-4">
            {consolidatedProducts.map((item: any, index: number) => (
              <li key={index}>
                {item.product.name} (x{item.quantity}) - ${parseFloat(item.product.price).toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

export default OrderItem;