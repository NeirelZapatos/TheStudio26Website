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
    images: z.array(z.string()).min(1, { message: "At least one image is required" }),
    quantity_in_stock: z.number().min(0, { message: "Quantity must be a positive number" }),
    purchaseType: z.enum(["Item", "Course"]),
    stripeProductId: z.string().optional(),

    // Jewelery Fields
    jewelry_type: z.string().optional(),
    metal_type: z.string().optional(),
    metal_finish: z.string().optional(),
    plating: z.string().optional(),
    ring_size: z.number().min(0, { message: "Size must be greater than 0"}).optional(),
    gauge: z.number().optional(),
    carat_weight: z.number().min(0, { message: "Carat Size must be greater than 0"}).optional(),
    setting_type: z.string().optional(),
    stone_arrangement: z.string().optional(),
    customization_options: z.string().optional(),

    // Tool Fields
    tool_type: z.string().optional(),
    brand: z.string().optional(),
    weight: z.number().optional(),
    material_composition: z.string().optional(),
    kit_type: z.string().optional(),
    kit_contents: z.string().optional(),
    silver_type: z.string().optional(),

    // stone fields
    stone_stock_stype: z.string().optional(),
    stone_thickness: z.number().min(0, {message: "thickness must be greater than 0"}).optional(),
    stone_diameter: z.number().min(0, {message: "diameter must be greater than 0"}).optional(),
    shape_variation: z.string().optional(),
    geographic_origin: z.string().optional(),
    mine_type: z.string().optional(),
    ethical_sourcing: z.string().optional(),
    location_status: z.string().optional(),
    stock_availability: z.string().optional(),
    clarity: z.string().optional(),
    primary_hue: z.string().optional(),
    color_saturation_and_tone: z.string().optional(),
    luster: z.string().optional(),
    transparency: z.string().optional(),
    treatment: z.string().optional(),
    cerification_available: z.boolean().optional(),
    grading_authority: z.string().optional(),
    origin_verification: z.string().optional(),
    cut_category: z.string().optional(),
    precious_stone: z.string().optional(),
    semi_precious_stone: z.string().optional(),
    organic_gem: z.string().optional(),
    synthetic_gem: z.string().optional(),
});

// Schema for items
export const itemSchema = baseProductSchema.extend({
    quantityInStock: z.string().min(0, { message: "Quantity must be a positive number" }),
    // category: z.string().min(1, { message: "Category is required" }),
    // material: z.string().min(1, { message: "Material is required" }),
    // color: z.string().min(1, { message: "Color is required" }),
    // size: z.string().min(1, { message: "Size is required" }),
    // image_url: z.string().min(1, { message: "Image URL is required" }),
});

// Schema for courses (if you need it)
export const courseSchema = baseProductSchema.extend({
    date: z.string().min(1, { message: "Date is required for courses" }),
    time: z.string().min(1, { message: "Time is required for courses" }),
    duration: z.number().min(0, { message: "Duration must be a positive number" }).optional(),
    // image_url: z.string().min(1, { message: "Image URL is required" }),
    instructor: z.string().optional(),
    location: z.string().optional(),
    max_capacity: z.number().min(1, { message: "Max capacity must be at least 1" }).optional(),
    stripeProductId: z.string().optional(),
    category: z.string().optional(),
    prerequisite: z.boolean().optional(),
    recurring_or_one_time: z.string().optional(),
});
// export const courseSchema = baseProductSchema.extend({
//     date: z.string().min(1, { message: "Date is required for courses" }),
//     time: z.string().min(1, { message: "Time is required for courses" }),
//     instructor: z.string().optional(),
//     duration: z.number().optional(),
//     location: z.string().optional(),
// });

export const productSchema = z.union([itemSchema, courseSchema]);