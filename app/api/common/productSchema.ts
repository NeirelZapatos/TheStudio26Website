import { z } from 'zod';

// Base schema for all products
const baseProductSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    price: z.number().min(0, { message: "Price must be a positive number" }),
    description: z.string().min(1, { message: "Description is required" }),
    size: z.string().optional(),
    image_url: z.string().min(1, { message: "Image URL is required" }),
    images: z.array(z.string()).min(1, { message: "At least one image is required" }).optional(),
    stripeProductId: z.string().optional(),
    color: z.string().optional(),

    // Jewelery Fields
    jewelry_type: z.string().optional(),
    metal_type: z.string().optional(),
    metal_finish: z.string().optional(),
    plating: z.string().optional(),
    ring_size: z.string().min(0, { message: "Size must be greater than 0"}).optional(),
    gauge: z.string().optional(),
    carat_weight: z.string().min(0, { message: "Carat Size must be greater than 0"}).optional(),
    setting_type: z.string().optional(),
    stone_arrangement: z.string().optional(),
    customization_options: z.string().optional(),

    // Tool Fields
    tool_type: z.string().optional(),
    essentials_type: z.string().optional(),
    brand: z.string().optional(),
    weight: z.string().optional(),
    material_composition: z.string().optional(),
    material_component: z.string().optional(),
    kit_type: z.string().optional(),
    kit_contents: z.string().optional(),
    supply_type: z.string().optional(),
    supply_brand: z.string().optional(),
    supply_material: z.string().optional(),

    // stone fields
    stone_stock_type: z.string().optional(),
    stone_thickness: z.string().min(0, {message: "thickness must be greater than 0"}).optional(),
    stone_diameter: z.string().min(0, {message: "diameter must be greater than 0"}).optional(),
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
    certification_available: z.string().optional(),
    grading_authority: z.string().optional(),
    origin_verification: z.string().optional(),
    cut_category: z.string().optional(),
    precious_stone: z.string().optional(),
    semi_precious_stone: z.string().optional(),
    organic_gem: z.string().optional(),
    synthetic_gem: z.string().optional(),
    cabachon_shape: z.string().optional(),
    faceted_cut: z.string().optional(),
    slab_cut: z.string().optional(),
    beads_type: z.string().optional(),
    hole_type: z.string().optional(),
    semi_precious_beryl: z.string().optional(),
    semi_precious_feldspar: z.string().optional(),
    other_semi_precious: z.string().optional(),
});

// Schema for items
export const itemSchema = baseProductSchema.extend({
    quantity_in_stock: z.number().min(0, { message: "Quantity must be a positive number" }),

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

export const productSchema = z.union([itemSchema, courseSchema]);