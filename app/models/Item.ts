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
    quantity_in_stock: string;
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
    size: {
        type: String,
    },
    color: {
        type: String,
    },
    quantity_in_stock: {
        type: String,
        required: true,
        default: 0,
        min: 0,
    },
});

const Item = mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema);

export default Item;