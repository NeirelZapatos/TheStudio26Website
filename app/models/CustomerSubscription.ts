import mongoose, { Document, Schema, Types } from "mongoose";

interface SubscriptionItem {
  stripeItemId: string;
  stripePriceId: string;
  stripeProductId: string;
  productId: Types.ObjectId;
  quantity: number;
  unitAmount: number;
  interval: string;
  intervalCount: number;
}

interface PaymentHistory {
  invoiceId: string;
  amountPaid: number;
  status: string;
  paidAt: Date;
}

export interface ICustomerSubscription extends Document {
  _id: Types.ObjectId;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  customerId: Types.ObjectId;
  status: string;
  productIds: Types.ObjectId[];
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  items: SubscriptionItem[];
  paymentHistory?: PaymentHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const customerSubscriptionSchema: Schema = new mongoose.Schema(
  {
    stripeSubscriptionId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer", // Reference to your customer collection
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "trialing", "paused"],
      index: true,
    },
    productIds: [{
      type: Schema.Types.ObjectId,
      ref: "Subscription", // Reference to the Subscription model
    }],
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    canceledAt: {
      type: Date,
    },
    items: [{
      stripeItemId: String,
      stripePriceId: String,
      stripeProductId: String,
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Subscription",
      },
      quantity: Number,
      unitAmount: Number,
      interval: String,
      intervalCount: Number,
    }],
    paymentHistory: [{
      invoiceId: String,
      amountPaid: Number,
      status: String,
      paidAt: Date,
    }],
  },
  {
    timestamps: true,
  }
);

const CustomerSubscription = mongoose.models.CustomerSubscription ||
  mongoose.model<ICustomerSubscription>("CustomerSubscription", customerSubscriptionSchema);

export default CustomerSubscription;