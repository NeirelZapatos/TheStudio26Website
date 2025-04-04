import mongoose, { Document, Schema, Types } from "mongoose"

export interface IBooking extends Document {
    course_id: Types.ObjectId;
    customer_id: Types.ObjectId;
    booking_date: Date;
    payment_status: string;
}


const bookingSchema:Schema = new mongoose.Schema({
    course_id: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    booking_date: {
        type: Date,
        required: true,
    },
    payment_status: {
        type: String,
        required: true,
    },
});

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

export default Booking;