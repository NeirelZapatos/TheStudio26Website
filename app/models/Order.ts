import mongoose, { Document, Schema, Types } from "mongoose";
import { ICustomer } from "./Customer";
import { IItem } from "./Item";

interface IParsedShippingAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

interface IShippingDetails {
    fromAddress: {
        name: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    weight: {
        value: number;
        units: string;
    };
    dimensions: {
        length: number;
        width: number;
        height: number;
        units: string;
    };
    shippingCost: number;
    subtotal: number;
    trackingNumber: string;
}

export interface IOrder extends Document {
    _id: Types.ObjectId;
    customer_id: Types.ObjectId;
    product_items: Types.ObjectId[];
    order_date: Date;
    total_amount: number;
    shipping_method: string;
    payment_method: string;
    order_status: 'pending' | 'pickup' | 'shipped' | 'delivered' | 'fulfilled';
    shipping_address: string;
    billing_address: string;
    customer?: ICustomer;
    products?: { product: IItem; quantity: number }[];
    parsedShippingAddress: IParsedShippingAddress;
    shippingDetails?: IShippingDetails; // Add shipping details
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
    shippingDetails: {
        fromAddress: {
            name: { type: String, default: '' },
            street: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            postalCode: { type: String, default: '' },
            country: { type: String, default: 'US' }
        },
        weight: {
            value: { type: Number, default: 0 },
            units: { type: String, default: 'ounces' }
        },
        dimensions: {
            length: { type: Number, default: 0 },
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 },
            units: { type: String, default: 'inches' }
        },
        shippingCost: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        trackingNumber: { type: String, default: '' } 

    }
});

// Virtual field for parsed shipping address
orderSchema.virtual('parsedShippingAddress').get(function (): IParsedShippingAddress {
    const doc = this as unknown as IOrder;
    const parts = doc.shipping_address?.split(", ").filter(Boolean) || [];
    const stateZip = parts[2]?.split(" ") || [];

    return {
        street: parts[0]?.trim() || '',
        city: parts[1]?.trim() || '',
        state: stateZip[0]?.trim() || '',
        zip: stateZip[1]?.trim() || '',
        country: parts[3]?.trim() || 'US'
    };
});

// Enable virtuals in responses
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Add type declaration for virtual properties
declare module 'mongoose' {
    interface Document {
        parsedShippingAddress: IParsedShippingAddress;
    }
    
    interface IOrder {
        parsedShippingAddress: IParsedShippingAddress;
    }
}

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
