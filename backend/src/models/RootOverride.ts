import mongoose, { Schema, Document } from 'mongoose';

export interface IRootOverride extends Document {
  page: string;
  elementId: string;
  selector: string;
  type: string;
  value: string;
  version: number;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RootOverrideSchema = new Schema<IRootOverride>(
  {
    page: { type: String, required: true, index: true },
    elementId: { type: String, required: true, index: true },
    selector: { type: String, required: true },
    type: { type: String, required: true, default: 'text' },
    value: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

RootOverrideSchema.index({ page: 1, elementId: 1 }, { unique: true });

export const RootOverride =
  mongoose.models.RootOverride || mongoose.model<IRootOverride>('RootOverride', RootOverrideSchema);

