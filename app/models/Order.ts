import mongoose, { Document, Schema, Types } from "mongoose";
import { ICustomer } from "./Customer";
import { IItem } from "./Item";
import { ICourse } from "./Course";

interface IParsedShippingAddress {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
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

// Class booking specific information
interface IClassBookingDetails {
    class_date: string;
    class_time: string;
    participants: number;
    instructor?: string;
    location?: string;
}

export interface IOrder extends Document {
    _id: Types.ObjectId;
    customer_id?: Types.ObjectId;
    product_items?: Types.ObjectId[];
    course_items?: Types.ObjectId[]; // Reference to Course documents
    order_date: string;
    total_amount?: number;
    shipping_method?: string;
    delivery_method?: 'pickup' | 'delivery'; // ! Added for choosing pick up or not
    payment_method?: string;
    order_status?: 'pending' | 'pickup' | 'shipped' | 'delivered' | 'fulfilled';
    shipping_address?: string;
    billing_address?: string;
    customer?: ICustomer;
    courses?: ICourse;
    products?: { product: IItem; quantity: number }[];
    parsedShippingAddress?: IParsedShippingAddress; // ! made optional in case pickup
    shippingDetails?: IShippingDetails;
    is_pickup: boolean;

    order_type: 'product' | 'class_booking'; // Distinguish between product orders and class bookings
    class_booking_details?: IClassBookingDetails; // Details for class bookings
    stripe_session_id?: string; // Store Stripe session ID

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
    delivery_method: {
        type: String,
        enum: ['pickup', 'delivery'],
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
        required: function (this: any) {
            return this.delivery_method === 'delivery'; // Only required for delivery orders
        }
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
    is_pickup: {
        type: Boolean,
        required: true,
        default: false
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
    },
    order_type: {
        type: String,
        enum: ['product', 'class_booking'],
        required: true,
        default: 'product'
    },
    class_booking_details: {
        class_date: {
            type: String,
            required: function (this: any) {
                return this.order_type === 'class_booking';
            }
        },
        class_time: {
            type: String,
            required: function (this: any) {
                return this.order_type === 'class_booking';
            }
        },
        participants: {
            type: Number,
            required: function (this: any) {
                return this.order_type === 'class_booking';
            },
            min: 1
        },
        instructor: String,
        location: String
    },
    stripe_session_id: {
        type: String
    }
});

// Virtual field for parsed shipping address // ! Adjust to only be processed for delivery orders
orderSchema.virtual('parsedShippingAddress').get(function (): IParsedShippingAddress | undefined {
    const doc = this as unknown as IOrder;

    // ! Only process shipping address for delivery orders
    if (doc.order_type === 'class_booking' || doc.delivery_method !== 'delivery' || !doc.shipping_address) {
        return undefined;
    }

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

// Middleware to set is_pickup based on delivery_method for product orders
orderSchema.pre('save', function(next) {
    if (this.order_type === 'product') {
        if (this.delivery_method === 'pickup') {
            this.is_pickup = true;
            this.shipping_address = undefined;
            this.shippingDetails = undefined;
        } else {
            this.is_pickup = false;
        }
    } else if (this.order_type === 'class_booking') {
        // For class bookings, we don't need shipping-related fields
        this.shipping_address = undefined;
        this.shippingDetails = undefined;
        this.shipping_method = undefined;
        this.is_pickup = undefined;
        this.delivery_method = undefined;
    }
    next();
});

// Enable virtuals in responses
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Add type declaration for virtual properties
declare module 'mongoose' {
    interface Document {
        parsedShippingAddress?: IParsedShippingAddress;
    }

    interface IOrder {
        parsedShippingAddress?: IParsedShippingAddress;
    }
}

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;