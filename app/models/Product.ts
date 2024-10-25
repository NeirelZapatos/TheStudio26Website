
import mongoose, { Document, Schema } from "mongoose"

export interface IProduct extends Document {
    name: string;
    price: number;
    description: string;
    category: string;
    material: string;
    image_url: string;
    size: string;
    color: string;
    quantity_in_stock: number;
}


const productSchema:Schema = new mongoose.Schema({
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
    category: {
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
        type: Number,
        required: true,
        min: 0
    },
});

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;

