/**
 * Mood Entry Model
 *
 * Stores user mood selections over time for analytics and chatbot personalization.
 */

import mongoose, { Document, Schema, Types } from 'mongoose';

export type MoodValue =
  | 'great'
  | 'good'
  | 'okay'
  | 'stressed'
  | 'anxious'
  | 'sad'
  | 'angry'
  | 'tired';

export interface IMoodEntry extends Document {
  userId?: Types.ObjectId;
  anonymousId?: string;
  mood: MoodValue;
  note?: string;
  at: Date;
  createdAt: Date;
  updatedAt: Date;
}

const moodEntrySchema = new Schema<IMoodEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    anonymousId: { type: String, index: true },
    mood: {
      type: String,
      enum: ['great', 'good', 'okay', 'stressed', 'anxious', 'sad', 'angry', 'tired'],
      required: true,
      index: true,
    },
    note: { type: String, trim: true },
    at: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true }
);

moodEntrySchema.index({ userId: 1, at: -1 });
moodEntrySchema.index({ anonymousId: 1, at: -1 });

export const MoodEntry = mongoose.model<IMoodEntry>('MoodEntry', moodEntrySchema);

