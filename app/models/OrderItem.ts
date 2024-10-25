import mongoose, { Document, Schema } from "mongoose"

export interface IOrderItem extends Document {
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
}


const orderItemSchema:Schema = new mongoose.Schema({
    order_id: {
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
    price: {
        type: Number,
        required: true,
    },
});

const OrderItem = mongoose.models.OrderItem || mongoose.model<IOrderItem>('OrderItem', orderItemSchema);

export default OrderItem;