/**
 * Order & Payment Models
 *
 * Multi-vendor orders support (each item belongs to a shop).
 * Status lifecycle: Pending → Processing → Shipped → Delivered.
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface IOrderItem {
  shopId: Types.ObjectId;
  productId: Types.ObjectId;
  name: string;
  unitPriceCents: number;
  quantity: number;
  currency: string;
  imageUrl?: string;
}

export interface IOrderAddress {
  fullName: string;
  email?: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface IPaymentRecord {
  provider: 'razorpay' | 'stripe' | 'paypal' | 'manual';
  providerPaymentId?: string;
  providerOrderId?: string;
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  amountCents: number;
  currency: string;
  raw?: Record<string, unknown>;
  createdAt: Date;
}

export interface IOrder extends Document {
  userId?: Types.ObjectId;
  anonymousId?: string;
  orderNumber: string;
  status: OrderStatus;
  items: IOrderItem[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  promoCode?: string;
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  payments: IPaymentRecord[];
  statusHistory: Array<{ status: OrderStatus; at: Date; note?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    name: { type: String, required: true },
    unitPriceCents: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    imageUrl: { type: String },
  },
  { _id: false }
);

const addressSchema = new Schema<IOrderAddress>(
  {
    fullName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
    country: { type: String, required: true, index: true },
    postalCode: { type: String, required: true },
  },
  { _id: false }
);

const paymentRecordSchema = new Schema<IPaymentRecord>(
  {
    provider: { type: String, enum: ['razorpay', 'stripe', 'paypal', 'manual'], required: true, index: true },
    providerPaymentId: { type: String, index: true },
    providerOrderId: { type: String, index: true },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    amountCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    raw: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: () => new Date(), index: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    anonymousId: { type: String, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    items: { type: [orderItemSchema], required: true, default: [] },
    subtotalCents: { type: Number, required: true, min: 0 },
    discountCents: { type: Number, default: 0, min: 0 },
    shippingCents: { type: Number, default: 0, min: 0 },
    totalCents: { type: Number, required: true, min: 0, index: true },
    currency: { type: String, default: 'INR' },
    promoCode: { type: String },
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema },
    payments: { type: [paymentRecordSchema], default: [] },
    statusHistory: {
      type: [
        new Schema(
          {
            status: {
              type: String,
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
              required: true,
            },
            at: { type: Date, default: () => new Date() },
            note: { type: String },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'items.shopId': 1, status: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);

