import mongoose, { Document, Schema } from "mongoose"

export interface ICustomer extends Document {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    shipping_address: string;
    billing_address: string;
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
        type: String,
    },
    shipping_address: {
        type: String,
    },
    billing_address: {
        type: String,
    },
});

const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;