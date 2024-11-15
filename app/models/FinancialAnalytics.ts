import { Schema, model, models } from "mongoose";

interface ITimeframeRevenue {
  daily: number[];
  weekly: number[];
  monthly: number[];
  quarterly: number[];
  yearly: number[];
}

interface IFinancialData {
  category: string;
  revenue: ITimeframeRevenue;
  createdAt: Date;
  updatedAt: Date;
}

const TimeframeRevenueSchema = new Schema({
  daily: { type: [Number], default: [] },
  weekly: { type: [Number], default: [] },
  monthly: { type: [Number], default: [] },
  quarterly: { type: [Number], default: [] },
  yearly: { type: [Number], default: [] }
});

const FinancialDataSchema = new Schema<IFinancialData>(
  {
    category: {
      type: String,
      required: true,
      enum: ['Courses', 'Supplies', 'Jewelry', 'Stones'],
      unique: true // Ensures one document per category
    },
    revenue: {
      type: TimeframeRevenueSchema,
      required: true,
      default: {
        daily: [],
        weekly: [],
        monthly: [],
        quarterly: [],
        yearly: []
      }
    }
  },
  { timestamps: true }
);

const FinancialData = models.FinancialData || model<IFinancialData>("FinancialData", FinancialDataSchema);

export default FinancialData;