/**
 * Cart Model
 *
 * MongoDB schema for shopping carts.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  itemId: string;
  itemType: 'program' | 'service' | 'pass' | 'course' | 'facility' | 'booking' | 'application' | 'retreat';
  title: string;
  subtitle?: string;
  thumbnail?: string;
  price?: number;
  quantity: number;
  metadata?: Record<string, unknown>;
  addedAt: Date;
  registrationUrl?: string;
}

export interface ICart extends Document {
  userId?: string;
  anonymousId?: string;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    itemId: { type: String, required: true },
    itemType: {
      type: String,
      enum: ['program', 'service', 'pass', 'course', 'facility', 'booking', 'application', 'retreat'],
      required: true,
    },
    title: { type: String, required: true },
    subtitle: { type: String },
    thumbnail: { type: String },
    price: { type: Number },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    metadata: { type: Schema.Types.Mixed },
    addedAt: { type: Date, default: Date.now },
    registrationUrl: { type: String },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: String,
      ref: 'User',
      index: true,
      sparse: true,
    },
    anonymousId: {
      type: String,
      index: true,
      sparse: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
cartSchema.index({ userId: 1 });
cartSchema.index({ anonymousId: 1 });
cartSchema.index({ updatedAt: -1 });

// Compound index for efficient lookups
cartSchema.index({ userId: 1, updatedAt: -1 });
cartSchema.index({ anonymousId: 1, updatedAt: -1 });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
