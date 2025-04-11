import { z } from 'zod';
import { Types } from 'mongoose';
import exp from 'constants';
import mongoose from 'mongoose';

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Input not instance of ObjectId",
});

// Zod schema for Order model
const schema = z.object({
  customer_id: objectIdSchema,
  // product_items: z.array(objectIdSchema),
  course_items: z.array(objectIdSchema),
  order_date: z.date(),
  // order_date: z.string(),
  // total_amount: z.number().min(0, { message: "Total amount must be a positive number" }),
  shipping_method: z.string(),
  payment_method: z.string(),
  order_status: z.enum(['pending', 'shipped', 'delivered', 'fulfilled']),
  shipping_address: z.string(),
  billing_address: z.string(),
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


export default schema;
