/**
 * User Profile Model
 *
 * Extended user profile used for form auto-fill and dashboard resume generation.
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  whatsapp?: string;
  age?: number;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  education?: string;
  skills?: string;
  availableFrom?: Date;
  duration?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userProfileSchema = new Schema<IUserProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    whatsapp: { type: String, trim: true },
    age: { type: Number, min: 0, max: 120 },
    gender: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    education: { type: String, trim: true },
    skills: { type: String, trim: true },
    availableFrom: { type: Date },
    duration: { type: String, trim: true },
  },
  { timestamps: true }
);

export const UserProfile = mongoose.model<IUserProfile>('UserProfile', userProfileSchema);

