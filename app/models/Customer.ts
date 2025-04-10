import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICustomer {
    _id?: Types.ObjectId; // Optional because it might not exist for new customers
    customer_id?: Types.ObjectId;
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    shipping_address?: string;
    billing_address?: string;
    orders?: Types.ObjectId[];
    courses?: Types.ObjectId[];
    labs?: Types.ObjectId[]; 
    // For subscription
    stripe_customer_id?: string;
    has_active_subscription?: boolean;
    subscriptions?: Types.ObjectId[];
}

const customerSchema: Schema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone_number: {
        type: String,
    },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    labs: [{
        type: Schema.Types.ObjectId,
        ref: 'Order' // Reference to the same Order model but specifically for lab bookings
    }],
    // ! subscription-related fields
    stripe_customer_id: {
        type: String,
        sparse: true, // Allows null values while maintaining uniqueness for non-null values
    },
    has_active_subscription: {
        type: Boolean,
        default: false,
    },
    subscriptions: [{
        type: Schema.Types.ObjectId,
        ref: 'CustomerSubscription'
    }],
}, {
    timestamps: true,
});

const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;