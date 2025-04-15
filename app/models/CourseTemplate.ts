import mongoose, { Schema, Document } from 'mongoose';

export interface IClassTemplate extends Document {
  name: string;
  description: string;
  price: string;
  image_url?: string;
  images?: string[];
  date?: string;
  time?: string;
  instructor?: string;
  duration?: string;
  location?: string;
  recurring?: boolean;
  classCategory?: string;
  prerequisite?: boolean;
  prerequisiteClass?: string;
}

const ClassTemplateSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          const numericValue = parseFloat(value);
          return !isNaN(numericValue) && numericValue >= 0 && /^\d+(\.\d{1,2})?$/.test(value);
        },
        message: "Price must be a positive number with up to 2 decimal places.",
      },
    },
    image_url: { type: String },
    images: { type: [String] },
    // Class-specific fields
    date: { type: String },
    time: { type: String },
    instructor: { type: String },
    duration: { type: String },
    location: { type: String },
    recurring: { type: Boolean, default: false },
    classCategory: { type: String },
    prerequisite: { type: Boolean, default: false },
    prerequisiteClass: { type: String },
  },
  { timestamps: true }
);

// Pre-save hook to format the price to 2 decimal places
ClassTemplateSchema.pre<IClassTemplate>('save', function (next) {
  if (this.price) {
    const numericValue = parseFloat(this.price);
    if (!isNaN(numericValue) && numericValue >= 0) {
      this.price = numericValue.toFixed(2);
    }
  }
  next();
});

const ClassTemplate = mongoose.models.ClassTemplate || mongoose.model<IClassTemplate>('ClassTemplate', ClassTemplateSchema);
export default ClassTemplate;