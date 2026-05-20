import mongoose, { Document, Schema } from 'mongoose';

export type UserActivityKind = 'program' | 'event' | 'service' | 'seva' | 'achievement' | 'note';

export interface IUserActivity extends Document {
  userId: mongoose.Types.ObjectId;
  kind: UserActivityKind;
  title: string;
  org?: string;
  department?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  hours?: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: {
      type: String,
      enum: ['program', 'event', 'service', 'seva', 'achievement', 'note'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    org: { type: String, trim: true },
    department: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    hours: { type: Number, min: 0 },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

userActivitySchema.index({ userId: 1, kind: 1, startDate: -1, createdAt: -1 });

export const UserActivity = mongoose.model<IUserActivity>('UserActivity', userActivitySchema);

