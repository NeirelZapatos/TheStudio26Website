import mongoose, { Document, Schema } from "mongoose";

export interface IItem extends Document {
    name: string;
    price: number;
    description: string;
    category: string;
    material: string;
    image_url: string;
    images: string[];
    size: string;
    color: string;
    quantityInStock: number;
}

const itemSchema: Schema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String },
    category: { type: String, required: true },
    itemType: { type: String },
    purchaseType: { type: String },
    material: { type: String },
    image_url: { type: String },
    images: { type: [String] },
    size: { type: String },
    color: { type: String },
    quantity_in_stock: { type: Number, required: true, default: 0, min: 0 },
    jewelry_type: { type: String },
    metal_type: { type: String },
    metal_purity: { type: String },
    metal_finish: { type: String },
    plating: { type: String },
    ring_size: { type: String },
    gauge: { type: String },
    carat_weight: { type: String },
    setting_type: { type: String },
    stone_arrangement: { type: String },
    customization_options: { type: String },
    tool_type: { type: String },
    essentials_type: { type: String },
    material_component: { type: String },
    brand: { type: String },
    weight: { type: String },
    material_composition: { type: String },
    kit_type: { type: String },
    kit_contents: { type: String },
    supply_type: { type: String },
    supply_brand: { type: String },
    supply_material: { type: String},
    silver_type: { type: String },
    stone_stock_type: { type: String },
    stone_thickness: { type: String },
    stone_diameter: { type: String },
    shape_variation: { type: String },
    geographic_origin: { type: String },
    mine_type: { type: String },
    ethical_sourcing: { type: String },
    location_status: { type: String },
    stock_availability: { type: String },
    clarity: { type: String },
    primary_hue: { type: String },
    color_saturation_and_tone: { type: String },
    luster: { type: String },
    transparency: { type: String },
    treatment: { type: String },
    certification_available: { type: String },
    grading_authority: { type: String },
    origin_verification: { type: String },
    cut_category: { type: String },
    precious_stone: { type: String },
    semi_precious_stone: { type: String },
    organic_gem: { type: String },
    synthetic_gem: { type: String },
    cabachon_shape: { type: String },
    faceted_cut: { type: String },
    slab_cut: { type: String },
    beads_type: { type: String },
    hole_type: { type: String },
    semi_precious_beryl: { type: String },
    semi_precious_feldspar: { type: String },
    other_semi_precious: { type: String },
});

const Item = mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema);

export default Item;