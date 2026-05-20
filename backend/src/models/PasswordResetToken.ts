/**
 * Password Reset Token Model
 *
 * Stores hashed reset tokens with expiry and single-use semantics.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

// TTL cleanup: delete tokens after expiry (MongoDB TTL monitor runs ~every 60s)
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ userId: 1, tokenHash: 1 }, { unique: true });

export const PasswordResetToken = mongoose.model<IPasswordResetToken>(
  'PasswordResetToken',
  passwordResetTokenSchema
);

