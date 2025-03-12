import mongoose, { Document, Schema, Types } from "mongoose"

export interface ILab extends Document {
    _id: Types.ObjectId;
    name: string;
    price: number;
    description: string;
    date: string;
    time: string;
    duration: number;
    image_url: string;
    instructor: string;
    location: string;
    max_capacity: number;
}


const labSchema:Schema = new mongoose.Schema({
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
    },
    // purchaseType: {
    //     type: String,
    //     required: true,
    // },
    date: {
        type: String,
        required: true
    },
    time: { 
        type: String, 
        required: true
    },
    duration: {
        type: Number,
    },
    image_url: {
        type: String,
    },
    instructor: {
        type: String,
    },
    location: {
        type: String,
    },
    max_capacity: {
        type: Number,
    },
    stripeProductId: {
        type: String,
        required: true,
        unique: true,
    },
});

const Lab = mongoose.models.Lab || mongoose.model<ILab>('Lab', labSchema);

export default Lab;