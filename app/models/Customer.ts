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
  }

const customerSchema:Schema = new mongoose.Schema({
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
    },
    phone_number: {
        type: Number,
    },
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }]
    // hashed_password: { not required for scope
    //     type: String
    // },
    // shipping_address: { For now lets store this is the orders area to make it less complicated
    //     type: String,
    // },
    // billing_address: {
    //     type: String,
    // },
});

const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;