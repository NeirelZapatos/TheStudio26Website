import mongoose, { Document, Schema, Types } from "mongoose";
import { IOrder } from "./Order";

export interface IShipping extends Document {
  order_id: Types.ObjectId | IOrder;
  address_from: {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
    metadata?: string;
  };
  address_to: {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone?: string;
    email?: string;
    metadata?: string;
  };
  parcel: {
    length: number;
    width: number;
    height: number;
    distance_unit: 'in' | 'cm';
    weight: number;
    mass_unit: 'lb' | 'kg';
  };
  shipment: {
    carrier_account: string;
    servicelevel_token: string;
    servicelevel_name?: string;
    label_file_type: 'pdf' | 'png';
    metadata?: Record<string, any>;
    shippo_shipment_id?: string;  // New field to store Shippo's shipment ID
  };
  transaction?: {
    shippo_id: string;
    tracking_number?: string;
    tracking_url?: string;
    label_url?: string;
    rate?: {
      currency: string;
      amount: number;
      provider?: string;  // Added to store carrier information
    };
    status?: 'SUCCESS' | 'ERROR' | 'QUEUED' | 'WAITING' | 'REFUNDED' | 'REFUNDPENDING';
  };
  status_history: {
    status: string;
    message?: string;
    date: Date;
  }[];
  estimated_delivery_date?: Date;  // Optional field for delivery estimation
  insurance_amount?: number;       // Optional field for shipping insurance
}

const shippingSchema = new Schema({
  order_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  address_from: {
    name: { type: String, required: false },
    street1: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    zip: { type: String, required: false },
    country: { type: String, default: 'US' },
    phone: String,
    email: String
  },
  
  address_to: {
    name: { type: String, required: true },
    street1: { type: String, required: true },
    // Make these optional for development
    city: { type: String, required: false },
    state: { type: String, required: false },
    zip: { type: String, required: false },
    country: { type: String, default: 'US' },
    phone: String,
    email: String
  },
  parcel: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    distance_unit: { type: String, default: 'in', enum: ['in', 'cm'] },
    weight: { type: Number, required: true },
    mass_unit: { type: String, default: 'lb', enum: ['lb', 'kg'] }
  },
  shipment: {
    carrier_account: { type: String, required: true },
    servicelevel_token: { type: String, required: true },
    label_file_type: { type: String, default: 'pdf', enum: ['pdf', 'png'] },
    metadata: Schema.Types.Mixed
  },
  transaction: {
    shippo_id: String,
    tracking_number: String,
    tracking_url: String,
    label_url: String,
    rate: {
      currency: String,
      amount: Number
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'ERROR', 'QUEUED', 'WAITING', 'REFUNDED', 'REFUNDPENDING']
    }
  },
  status_history: [{
    status: { type: String, required: true },
    message: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const Shipping = mongoose.models.Shipping || mongoose.model<IShipping>('Shipping', shippingSchema);

export default Shipping;