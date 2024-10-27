// Bypassing this straight to product

import mongoose, { Document, Schema, Types } from "mongoose"

export interface IOrderItem extends Document {
    order_id: Types.ObjectId;
    product_id: Types.ObjectId;
    quantity: number;
    price: number;
}


const orderItemSchema:Schema = new mongoose.Schema({
    order_id: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
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
    price: {
        type: Number,
        required: true,
    },
});

const OrderItem = mongoose.models.OrderItem || mongoose.model<IOrderItem>('OrderItem', orderItemSchema);

export default OrderItem;