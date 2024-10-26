import mongoose, { Document, Schema, Types } from "mongoose"

export interface IShoppingCart extends Document {
    order_id: Types.ObjectId;
    customer_id: Types.ObjectId;
    product_id: Types.ObjectId;
    quantity: number;
}


const shoppingCartSchema:Schema = new mongoose.Schema({
    order_id: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
});

const ShoppingCart = mongoose.models.ShoppingCart || mongoose.model<IShoppingCart>('ShoppingCart', shoppingCartSchema);

export default ShoppingCart;