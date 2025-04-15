import mongoose, { Document, Schema, Types } from "mongoose";
import { IOrder } from "./Order";

export interface IShipping extends Document {
  order_id: Types.ObjectId | IOrder;
  address_from: {
    name: string;
    company?: string;
    street1: string;
    street2?: string;
    street3?: string;
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
    street3?: string;
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
    distanceUnit: 'in' | 'cm';
    weight: number;
    massUnit: 'lb' | 'kg';
  };
  shipment: {
    carrier_account: string;
    servicelevel_token: string;
    name?: string;
    metadata?: Record<string, any>;
    shippo_shipment_id?: string;  // Store Shippo's shipment ID
  };
  transaction: {
    shippo_id: string;
    tracking_number?: string;
    tracking_status?: string;      // Added tracking_status field
    tracking_url?: string;
    tracking_provider?: string;    // Added tracking provider URL
    label_url?: string;
    rate?: {
      currency: string;
      amount: number;
      provider?: string;
    };
    status?: 'SUCCESS' | 'ERROR' | 'QUEUED' | 'WAITING' | 'REFUNDED' | 'REFUNDPENDING';
  };
  status_history: {
    status: string;
    message?: string;
    date: Date;
  }[];
  estimated_delivery_date?: Date;
  insurance_amount?: number;
  object_id?: string;              // Shippo's object ID
  object_owner?: string;           // Shippo user email
  object_created?: Date;           // When created in Shippo
  object_updated?: Date;           // When updated in Shippo
  eta?: Date;                      // Estimated time of arrival
  messages?: string[];             // Any messages from Shippo
  webhook_events?: {               // Track webhook events
    event: string;
    data: any;
    timestamp: Date;
  }[];
  commercial_invoice_url?: string; // URL for commercial invoice if applicable
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
    street2: { type: String, required: false },
    street3: { type: String, required: false },
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
    street2: { type: String, required: false},
    street3: { type: String, required: false },
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
    distanceUnit: { type: String, default: 'in', enum: ['in', 'cm'] },
    weight: { type: Number, required: true },
    massUnit: { type: String, default: 'lb', enum: ['lb', 'kg'] }
  },
  shipment: {
    carrier_account: { type: String, required: true },
    servicelevel_token: { type: String, required: true },
    shippo_shipment_id: String,
    metadata: Schema.Types.Mixed
  },
  transaction: {
    shippo_id: String,
    tracking_number: String,
    tracking_status: String,
    tracking_url: String,
    tracking_provider: String,
    label_url: String,
    rate: {
      currency: String,
      amount: Number,
      provider: String
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
  }],
  estimated_delivery_date: Date,
  insurance_amount: Number,
  object_id: String,
  object_owner: String,
  object_created: Date,
  object_updated: Date,
  eta: Date,
  messages: [String],
  webhook_events: [{
    event: { type: String, required: true },
    data: Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],
  commercial_invoice_url: String
}, {
  timestamps: true
});

const Shipping = mongoose.models.Shipping || mongoose.model<IShipping>('Shipping', shippingSchema);

export default Shipping;