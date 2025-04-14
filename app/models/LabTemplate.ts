import mongoose, { Schema, Document } from 'mongoose';

export interface ILabTemplate extends Document {
  name: string;
  description: string;
  price: string;
  image_url?: string;
  images?: string[];
  duration?: string; 
  location?: string;
  max_capacity?: string;
  category: string;
  type?: string;
}

const LabTemplateSchema: Schema = new Schema(
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
    category: { type: String, required: true, default: "Lab" },
    image_url: { type: String },
    images: { type: [String] },
    
    // Lab-specific fields
    duration: { type: String },
    location: { type: String },
    max_capacity: { type: String },
    type: { type: String },
  },
  { timestamps: true }
);

// Pre-save hook to format the price to 2 decimal places
LabTemplateSchema.pre<ILabTemplate>('save', function (next) {
  if (this.price) {
    const numericValue = parseFloat(this.price);
    if (!isNaN(numericValue) && numericValue >= 0) {
      this.price = numericValue.toFixed(2); 
    }
  }
  
  this.category = "Lab";
  
  next();
});

const LabTemplate = mongoose.models.LabTemplate || mongoose.model<ILabTemplate>('LabTemplate', LabTemplateSchema);
export default LabTemplate;