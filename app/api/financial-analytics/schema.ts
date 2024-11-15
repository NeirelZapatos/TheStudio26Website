import { Schema, model, models } from "mongoose";

// Define the structure for the revenue data across different timeframes
const TimeframeRevenueSchema = new Schema(
  {
    daily: { type: [Number], default: [] },
    weekly: { type: [Number], default: [] },
    monthly: { type: [Number], default: [] },
    quarterly: { type: [Number], default: [] },
    yearly: { type: [Number], default: [] },
  },
  { _id: false } // Don't create an _id for this sub-schema
);

// Define the main schema for financial data
const FinancialDataSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["Courses", "Jewelry", "Stones", "Supplies"], // Enum of categories
      unique: true, // Ensures one document per category
    },
    revenue: {
      type: TimeframeRevenueSchema,
      required: true,
      default: {
        daily: [],
        weekly: [],
        monthly: [],
        quarterly: [],
        yearly: [],
      },
    },
    sales: [
      {
        price: { type: Number, required: true },
        date: { type: Date, required: true },
      }
    ],
    categories: {
      type: Map,
      of: {
        revenue: { type: Number },
      },
      default: {
        "Courses": { revenue: 0 },
        "Jewelry": { revenue: 0 },
        "Stones": { revenue: 0 },
        "Supplies": { revenue: 0 },
      },
    },
  },
  { timestamps: true } // Automatically create timestamps for createdAt and updatedAt
);

// Ensure proper types for the schema
interface IFinancialData {
  category: string;
  revenue: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    quarterly: number[];
    yearly: number[];
  };
  sales: { price: number; date: Date }[];  // Add sales field for calculating revenue
  categories: Record<string, { revenue: number }>;
  createdAt: Date;
  updatedAt: Date;
}

// Check if the model already exists, otherwise create a new model
const FinancialData = models.FinancialData || model<IFinancialData>("FinancialData", FinancialDataSchema);

export default FinancialData;
