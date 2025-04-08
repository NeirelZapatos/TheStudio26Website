import mongoose, { Document, Schema, Types } from "mongoose";
import { ICustomer } from "./Customer";
import { IItem } from "./Item";
import { ICourse } from "./Course";
import { IShipping } from "./Shipping";

export interface IOrder extends Document {
    _id: Types.ObjectId;
    customer_id?: Types.ObjectId;
    product_items?: Types.ObjectId[];
    course_items?: Types.ObjectId[]; // Reference to Course documents
    order_date: string;
    total_amount?: number;
    payment_method?: string;
    order_status?: 'pending' | 'pickup' | 'shipped' | 'delivered' | 'fulfilled';
    billing_address?: string;
    customer?: ICustomer;
    courses?: ICourse;
    products?: { product: IItem; quantity: number }[];
    shipping_id?: Types.ObjectId | IShipping; // Reference to Shipping document
}

const orderSchema: Schema = new mongoose.Schema({
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    product_items: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    course_items: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    order_date: {
        type: Date,
        required: true,
    },
    total_amount: {
        type: Number,
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
    billing_address: {
        type: String,
        required: true
    },
    products: {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    shipping_id: {
        type: Schema.Types.ObjectId,
        ref: 'Shipping'
    }
});


const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;