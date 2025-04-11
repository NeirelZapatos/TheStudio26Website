import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISubscription extends Document {
    _id: Types.ObjectId;
    name: string;
    price: number;
    description: string;
    image_url: string;
    images?: string[];
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
    active: boolean;
    stripeProductId: string;
    stripePriceId?: string;
}

const subscriptionSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image_url: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
    },
    interval: {
        type: String,
        required: true,
        enum: ["day", "week", "month", "year"],
        default: "month",
    },
    intervalCount: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    active: {
        type: Boolean,
        default: true,
    },
    stripeProductId: {
        type: String,
        required: true,
    },
    stripePriceId: {
        type: String,
        unique: true,
        sparse: true,
    },
}, {
    timestamps: true,
});

const Subscription = mongoose.models.Subscription || 
    mongoose.model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;