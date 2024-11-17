
import mongoose, { Document, Schema } from "mongoose"

export interface IItem extends Document {
    name: string;
    price: number;
    description: string;
    category: string;
    material: string;
    image_url: string;
    size: string;
    color: string;
    quantity_in_stock: number;
    stripeProductId: string;
}


const itemSchema:Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
    },
    purchaseType: {
        type: String,
        required: true,
    },
    category: { 
        // Categories include Courses, Jewlery, Stones, Supplies
        type: String,
        required: true
    },
    material: {
        type: String,
    },
    image_url: {
        type: String,
    },
    size: {
        type: String,
    },
    color: {
        type: String,
    },
    quantity_in_stock: {
        type: Number,
        // required: true,
        default: 0,
        min: 0,
    },
    stripeProductId: {
        type: String,
        required: true,
        unique: true,
    },
});

const Item = mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema);

export default Item;