import mongoose, { Schema, Document } from 'mongoose';

export interface IDonationConfig extends Document {
  eventSlug: string;
  googlePay?: string;
  phonePe?: string;
  upiId?: string;
  qrImagePath?: string; // public path served by frontend, e.g. /images/events/upi-qr.svg
  phoneNumber?: string;
  updatedAt: Date;
  createdAt: Date;
}

const DonationConfigSchema = new Schema<IDonationConfig>(
  {
    eventSlug: { type: String, required: true, unique: true, index: true },
    googlePay: { type: String },
    phonePe: { type: String },
    upiId: { type: String },
    qrImagePath: { type: String },
    phoneNumber: { type: String },
  },
  { timestamps: true }
);

export const DonationConfig =
  mongoose.models.DonationConfig || mongoose.model<IDonationConfig>('DonationConfig', DonationConfigSchema);

