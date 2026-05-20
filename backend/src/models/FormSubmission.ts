/**
 * Form Submission Model (Seva & Careers)
 *
 * Stores validated structured fields plus file URLs (S3),
 * supports serial numbers and Google Sheets sync markers.
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

export type FormType = 'seva' | 'career';

export interface IFormFile {
  kind: 'resume' | 'photo';
  url: string;
  originalName?: string;
  contentType?: string;
  sizeBytes?: number;
}

export interface IFormSubmission extends Document {
  formType: FormType;
  serialNumber: number;
  heading: string;
  userId?: Types.ObjectId;
  anonymousId?: string;

  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  type?: string;
  position?: string;
  age?: number;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  education?: string;
  skills?: string;
  availableFrom?: Date;
  duration?: string;
  whyJoin?: string;

  files: IFormFile[];

  syncedToSheetsAt?: Date;
  sheetsRowId?: string;

  createdAt: Date;
  updatedAt: Date;
}

const formFileSchema = new Schema<IFormFile>(
  {
    kind: { type: String, enum: ['resume', 'photo'], required: true },
    url: { type: String, required: true },
    originalName: { type: String },
    contentType: { type: String },
    sizeBytes: { type: Number },
  },
  { _id: false }
);

const formSubmissionSchema = new Schema<IFormSubmission>(
  {
    formType: { type: String, enum: ['seva', 'career'], required: true, index: true },
    serialNumber: { type: Number, required: true },
    heading: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    anonymousId: { type: String, index: true },

    fullName: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    whatsapp: { type: String, trim: true },
    type: { type: String, trim: true },
    position: { type: String, trim: true, index: true },
    age: { type: Number, min: 0, max: 120 },
    gender: { type: String, trim: true },
    city: { type: String, trim: true, index: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, index: true },
    education: { type: String, trim: true },
    skills: { type: String, trim: true },
    availableFrom: { type: Date },
    duration: { type: String, trim: true },
    whyJoin: { type: String, trim: true },

    files: { type: [formFileSchema], default: [] },

    syncedToSheetsAt: { type: Date, index: true },
    sheetsRowId: { type: String },
  },
  { timestamps: true }
);

formSubmissionSchema.index({ formType: 1, serialNumber: -1 }, { unique: true });
formSubmissionSchema.index({ createdAt: -1 });

export const FormSubmission = mongoose.model<IFormSubmission>('FormSubmission', formSubmissionSchema);

