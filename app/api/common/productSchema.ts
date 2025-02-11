import { z } from 'zod';

// Base schema for all products
const baseProductSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    price: z.number().min(0, { message: "Price must be a positive number" }),
    description: z.string().optional(),
    category: z.string().optional(),
    material: z.string().optional(),
    image_url: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    purchaseType: z.enum(["Item", "Course"]),
});

// Schema for items, extending base schema without additional fields
export const itemSchema = baseProductSchema.extend({
    itemType: z.string().optional(), // Specific to items if needed
    quantity_in_stock: z.number().min(0).optional(), // Only for items
});

// Schema for courses, extending base schema with course-specific fields
export const courseSchema = baseProductSchema.extend({
    date: z.string().min(1, { message: "Date is required for courses" }),
    time: z.string().min(1, { message: "Time is required for courses" }),
    instructor: z.string().optional(),
    duration: z.number().optional(),
    location: z.string().optional(),
});

// Function to choose schema based on purchaseType
export const productSchema = z.union([itemSchema, courseSchema]);