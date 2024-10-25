import mongoose, { Document, Schema } from "mongoose"

export interface IShoppingCart extends Document {
    order_id: string;
    customer_id: string;
    product_id: string;
    quantity: number;
}


const shoppingCartSchema:Schema = new mongoose.Schema({
    order_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    customer_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    product_id: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const ShoppingCart = mongoose.models.ShoppingCart || mongoose.model<IShoppingCart>('ShoppingCart', shoppingCartSchema);

export default ShoppingCart;