import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Input not instance of ObjectId",
});

// Schema for class booking details
const classBookingDetailsSchema = z.object({
  class_date: z.string(),
  class_time: z.string(),
  participants: z.number().min(1, { message: "Participants must be at least 1" }),
  instructor: z.string().optional(),
  location: z.string().optional(),
});

// Zod schema for Order model
const orderSchema = z.object({
  customer_id: objectIdSchema,
  product_items: z.array(objectIdSchema).optional(),
  course_items: z.array(objectIdSchema).optional(),
  lab_items: z.array(objectIdSchema).optional(),
  order_date: z.date(),
  total_amount: z.number().min(0, { message: "Total amount must be a positive number" }),
  shipping_method: z.string(),
  delivery_method: z.enum(['pickup', 'delivery']).optional(),
  payment_method: z.string(),
  order_status: z.enum(['pending', 'shipped', 'delivered', 'fulfilled']),
  shipping_address: z.string(),
  billing_address: z.string(),
  order_type: z.enum(['product', 'class_booking']),
  class_booking_details: classBookingDetailsSchema.optional(),
  is_pickup: z.boolean().optional(),
  stripe_session_id: z.string().optional(),
  // Uncomment and adjust if using nested products
  // products: z.array(
  //   z.object({
  //     product: z.instanceof(Types.ObjectId).refine((val) => val instanceof Types.ObjectId, {
  //       message: "Invalid ObjectId",
  //     }),
  //     quantity: z.number().min(1, { message: "Quantity must be at least 1" }),
  //   })
  // ),
});

const productOrderSchema = orderSchema.refine(
  (data) => {
    if (data.order_type === 'product') {
      return (
        data.product_items !== undefined && 
        data.product_items.length > 0 &&
        data.delivery_method !== undefined
      );
    }
    return true;
  },
  {
    message: "Product orders must have product items and a delivery method",
    path: ['product_items', 'delivery_method'],
  }
);

const classBookingSchema = orderSchema.refine(
  (data) => {
    if (data.order_type === 'class_booking') {
      return (
        data.course_items !== undefined && 
        data.course_items.length > 0 &&
        data.class_booking_details !== undefined
      );
    }
    return true;
  },
  {
    message: "Class bookings must have course items and booking details",
    path: ['course_items', 'class_booking_details'],
  }
);

const schema = z.union([productOrderSchema, classBookingSchema]);

export default schema;
