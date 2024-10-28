import mongoose, { Document, Schema, Types } from "mongoose"

export interface IOrder extends Document {
    customer_id: Types.ObjectId;
    product_items: Types.ObjectId[];
    order_date: Date;
    total_amount: number;
    shipping_method: string;
    payment_method: string;
    order_status: 'pending' | 'shipped' | 'delivered';
    // products: [{
    //     product: Types.ObjectId;
    //     quantity: number;
    // }]
}


const orderSchema:Schema = new mongoose.Schema({
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    product_items: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    order_date: {
        type: Date,
        required: true,
    },
    total_amount: {
        type: Number,
        required: true,
    },
    shipping_method: {
        type: String,
        required: true,
    },
    payment_method: {
        type: String,
        required: true,
    },
    order_status: {
        type: String,
        required: true,
    },
    shipping_address: { 
        type: String,
        required: true
    },
    billing_address: {
        type: String,
        required: true
    },
//     products: {
//         product: {
//             type: Schema.Types.ObjectId,
//             ref: 'Product',
//             required: true
//         },
//         quantity: {
//             type: Number,
//             required: true,
//             min: 1
//         }
//     },
});

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;