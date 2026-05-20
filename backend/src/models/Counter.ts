/**
 * Counter Model
 *
 * Used for concurrency-safe serial numbers (per form type).
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface ICounter extends Document {
  key: string;
  value: number;
  updatedAt: Date;
  createdAt: Date;
}

const counterSchema = new Schema<ICounter>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const Counter = mongoose.model<ICounter>('Counter', counterSchema);

