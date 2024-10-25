import mongoose, { Document, Schema } from "mongoose"

export interface ICourse extends Document {
    name: string;
    price: number;
    description: string;
    date: Date;
    time: string;
    duration: number;
    image_url: string;
    instructor: string;
    location: string;
    max_capacity: number;
}


const courseSchema:Schema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
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
});

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);

export default Course;