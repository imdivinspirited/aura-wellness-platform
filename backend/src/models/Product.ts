/**
 * Product Model
 *
 * Marketplace product owned by a Shop.
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  shopId: Types.ObjectId;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  stock: number;
  images: string[];
  tags: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    priceCents: { type: Number, required: true, min: 0, index: true },
    currency: { type: String, default: 'INR' },
    stock: { type: Number, default: 0, min: 0, index: true },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [], index: true },
    isPublished: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

productSchema.index({ shopId: 1, slug: 1 }, { unique: true });
productSchema.index({ isPublished: 1, priceCents: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);

