import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailTemplate extends Document {
  name: string;
  content: object; // JSON representation of the email template
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      unique: true,
    },
    content: {
      type: Object,
      required: [true, 'Template content is required'],
    },
  },
  { timestamps: true }
);

// Check if the model already exists to prevent overwriting during hot reloading
export default mongoose.models.EmailTemplate || 
  mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);