import { Weight } from "lucide-react";
import mongoose, { Document, Schema } from "mongoose"

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
    quantityInStock: string;
}


const itemSchema:Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
        min: 0
    },
    description: {
        type: String,
    },
    itemType: {
        type: String,
    },
    purchaseType: {
        type: String,
    },
    material: {
        type: String,
    },
    image_url: {
        type: String,
    },
    images: {
        type: [String],
    },
    size: {
        type: String,
    },
    color: {
        type: String,
    },
    quantityInStock: {
        type: String,
        required: true,
        default: 0,
        min: 0,
    },
    
    // jewlery fields
    jewelry_type: {
        type: String,
    },
    metal_type: {
        type: String,
    },
    metal_purity: {
        type: String
    },
    metal_finish: {
        type: String
    },
    plating: {
        type: String
    },
    ring_size: {
        type: Number
    },
    gauge: {
        type: Number
    },
    carat_weight: {
        type: Number
    },
    setting_type: {
        type: String
    },
    stone_arrangement: {
        type: String
    },
    customization_options: {
        type: String
    },

    // Tool Fields
    tool_type: {
        type: String
    },
    brand: {
        type: String
    },
    // field already exists
    // size: {
    //     type: String
    // },
    weight: {
        type: Number
    },
    material_composition: {
        type: String
    },
    // field already exists
    // material: {
    //     type: String
    // },
    kit_type: {
        type: String
    },
    kit_contents: {
        type: String
    },
    silver_type: {
        type: String
    },

    // Stone Fields
    stone_stock_stype: {
        type: String
    },
    // field already exists
    // weight: {
    //     type: String
    // },
    // field already exists
    // size: {
    //     type: String
    // },
    stone_thickness: {
        type: Number
    },
    stone_diameter: {
        type: Number
    },
    shape_variation: {
        type: String
    },
    geographic_origin: {
        type: String
    },
    mine_type: {
        type: String
    },
    ethical_sourcing: {
        type: String
    },
    location_status: {
        type: String
    },
    stock_availability: {
        type: String
    },
    clarity: {
        type: String
    },
    primary_hue: {
        type: String
    },
    color_saturation_and_tone: {
        type: String
    },
    luster: {
        type: String
    },
    transparency: {
        type: String
    },
    treatment: {
        type: String
    },
    cerification_available: {
        type: Boolean
    },
    grading_authority: {
        type: String
    },
    origin_verification: {
        type: String
    },
    cut_category: {
        type: String
    },
    precious_stone: {
        type: String
    },
    semi_precious_stone: {
        type: String
    },
    organic_gem: {
        type: String
    },
    synthetic_gem: {
        type: String
    },
});

const Item = mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema);

export default Item;