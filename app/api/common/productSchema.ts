import { z } from 'zod';

// Base schema for all products
const baseProductSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    price: z.number().min(0, { message: "Price must be a positive number" }),
    description: z.string().min(1, { message: "Description is required" }),
    category: z.string().min(1, { message: "Category is required" }),
    material: z.string().min(1, { message: "Material is required" }),
    color: z.string().min(1, { message: "Color is required" }),
    size: z.string().min(1, { message: "Size is required" }),
    image_url: z.string().min(1, { message: "Image URL is required" }),
    quantity_in_stock: z.number().min(0, { message: "Quantity must be a positive number" }),
    purchaseType: z.enum(["Item", "Course"]),
    stripeProductId: z.string().optional(),
});

// Schema for items
export const itemSchema = baseProductSchema.extend({});

// Schema for courses (if you need it)
export const courseSchema = baseProductSchema.extend({
    date: z.string().min(1, { message: "Date is required for courses" }),
    time: z.string().min(1, { message: "Time is required for courses" }),
    instructor: z.string().optional(),
    duration: z.number().optional(),
    location: z.string().optional(),
});

export const productSchema = z.union([itemSchema, courseSchema]);