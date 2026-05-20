/**
 * Service Model
 *
 * Represents on-campus services (Dining, Stay, Transport, Facilities, etc.).
 * These should be editable via admin CMS and used by chatbot ingestion.
 */

import mongoose, { Document, Schema } from 'mongoose';

export type ServiceCategory =
  | 'dining'
  | 'stay'
  | 'transport'
  | 'facilities'
  | 'shopping'
  | 'support'
  | 'other';

export interface IService extends Document {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: ServiceCategory;
  tags: string[];
  heroImageUrl?: string;
  galleryImageUrls: string[];
  youtubeVideoIds: string[];
  isPublished: boolean;
  languages: string[];
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 280 },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['dining', 'stay', 'transport', 'facilities', 'shopping', 'support', 'other'],
      required: true,
      index: true,
    },
    tags: { type: [String], default: [], index: true },
    heroImageUrl: { type: String },
    galleryImageUrls: { type: [String], default: [] },
    youtubeVideoIds: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false, index: true },
    languages: { type: [String], default: ['en'], index: true },
  },
  { timestamps: true }
);

serviceSchema.index({ category: 1, isPublished: 1 });

export const Service = mongoose.model<IService>('Service', serviceSchema);

