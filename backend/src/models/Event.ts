/**
 * Event Model
 *
 * Supports public listings, timezone-aware schedules, and international visibility.
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEventSchedule {
  startAt: Date;
  endAt?: Date;
  timezone: string;
}

export interface IEvent extends Document {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  tags: string[];
  schedule: IEventSchedule;
  location?: {
    name?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    lat?: number;
    lng?: number;
  };
  heroImageUrl?: string;
  galleryImageUrls: string[];
  youtubeVideoIds: string[];
  isPublished: boolean;
  isInternationalVisible: boolean;
  languages: string[];
  programRef?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventScheduleSchema = new Schema<IEventSchedule>(
  {
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date },
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent>(
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
    tags: { type: [String], default: [], index: true },
    schedule: { type: eventScheduleSchema, required: true },
    location: {
      name: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String, index: true },
      state: { type: String },
      country: { type: String, index: true },
      postalCode: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    heroImageUrl: { type: String },
    galleryImageUrls: { type: [String], default: [] },
    youtubeVideoIds: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false, index: true },
    isInternationalVisible: { type: Boolean, default: true, index: true },
    languages: { type: [String], default: ['en'], index: true },
    programRef: { type: Schema.Types.ObjectId, ref: 'Program', index: true },
  },
  { timestamps: true }
);

eventSchema.index({ isPublished: 1, 'schedule.startAt': 1 });
eventSchema.index({ isInternationalVisible: 1, 'schedule.startAt': 1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);

