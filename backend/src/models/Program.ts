/**
 * Program Model
 *
 * Core representation of Art of Living programs
 * (Happiness Program, Silence Retreat, Children/Teens, etc.).
 *
 * This is the authoritative source for program metadata used across:
 * - Public program pages
 * - User dashboards (attendance, eligibility)
 * - AI chatbot content ingestion
 * - International Visitors listings
 */

import mongoose, { Document, Schema } from 'mongoose';

export type ProgramCategory =
  | 'beginning'
  | 'advance'
  | 'children_teens'
  | 'more'
  | 'retreats';

export type ProgramAudience = 'children' | 'teens' | 'adults' | 'families' | 'corporate';

export interface IProgram extends Document {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: ProgramCategory;
  tags: string[];
  audience: ProgramAudience[];
  durationDays?: number;
  isOnline: boolean;
  baseTimezone: string;
  languages: string[];
  isInternationalVisible: boolean;
  heroImageUrl?: string;
  galleryImageUrls: string[];
  youtubeVideoIds: string[];
  metadata: {
    difficulty?: 'introductory' | 'intermediate' | 'advanced';
    prerequisiteText?: string;
    benefits?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const programSchema = new Schema<IProgram>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['beginning', 'advance', 'children_teens', 'more', 'retreats'],
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    audience: {
      type: [String],
      enum: ['children', 'teens', 'adults', 'families', 'corporate'],
      default: ['adults'],
    },
    durationDays: {
      type: Number,
      min: 1,
      max: 60,
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    baseTimezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    languages: {
      type: [String],
      default: ['en'],
      index: true,
    },
    isInternationalVisible: {
      type: Boolean,
      default: true,
      index: true,
    },
    heroImageUrl: {
      type: String,
    },
    galleryImageUrls: {
      type: [String],
      default: [],
    },
    youtubeVideoIds: {
      type: [String],
      default: [],
    },
    metadata: {
      difficulty: {
        type: String,
        enum: ['introductory', 'intermediate', 'advanced'],
      },
      prerequisiteText: {
        type: String,
      },
      benefits: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

programSchema.index({ category: 1, isInternationalVisible: 1 });

export const Program = mongoose.model<IProgram>('Program', programSchema);

