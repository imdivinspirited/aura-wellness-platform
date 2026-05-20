/**
 * Refresh Token Model
 *
 * Stores hashed refresh tokens for rotation + revocation.
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedByTokenHash?: string;
  createdByIp?: string;
  createdByUserAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date },
    replacedByTokenHash: { type: String },
    createdByIp: { type: String },
    createdByUserAgent: { type: String },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1, tokenHash: 1 }, { unique: true });

export const RefreshToken = mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);

