import mongoose, { Document, Schema } from "mongoose";

export interface IRentalItem extends Document {
  name: string;
  price: number;
  order?: number;
}

const rentalItemSchema = new Schema<IRentalItem>({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  order: {
    type: Number,
    default: 1,
  },
});

const RentalItem =
  mongoose.models.RentalItem ||
  mongoose.model<IRentalItem>("RentalItem", rentalItemSchema);

export default RentalItem;