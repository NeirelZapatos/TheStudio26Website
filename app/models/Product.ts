
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

/*
const productSchema:Schema = new mongoose.Schema({
    name: {

    }
    price: {

    }
    description: {
        
    }
    category: {
        
    }
    material: {
        
    }
    image_url: {

    }
    size: {
        
    }
    color: {
        
    }
    quantity_in_stock: {
        
    }
});

*/
