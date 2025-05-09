import mongoose, { Document, Schema, Types } from "mongoose"

export interface ICourse extends Document {
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


const courseSchema: Schema = new mongoose.Schema({
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
        required: function (this: { purchaseType: string }) {
            return this.purchaseType === "Course";
        },
    },
    time: {
        type: String,
        required: function (this: { purchaseType: string }) {
            return this.purchaseType === 'Course';
        }
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
    class_category: {
        type: String
    },
    prerequisite: {
        type: Boolean
    },
    prerequisiteClass: {
        type: String,
    },
});

const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);

export default Course;