/**
 * Shop Model (Multi-vendor)
 *
 * Represents a vendor/shop profile for the marketplace.
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

export type ShopStatus = 'active' | 'inactive' | 'suspended';

export interface IShop extends Document {
  slug: string;
  name: string;
  logoUrl?: string;
  status: ShopStatus;
  contact: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
  };
  ownerUserIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const shopSchema = new Schema<IShop>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, index: true },
    logoUrl: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
      index: true,
    },
    contact: {
      email: { type: String },
      phone: { type: String },
      whatsapp: { type: String },
      address: { type: String },
    },
    ownerUserIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
      index: true,
    },
  },
  { timestamps: true }
);

shopSchema.index({ status: 1, name: 1 });

export const Shop = mongoose.model<IShop>('Shop', shopSchema);

