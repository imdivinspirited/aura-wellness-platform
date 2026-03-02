/**
 * User Model
 *
 * MongoDB schema for users.
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  anonymousId?: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin' | 'root';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: false, // Optional for anonymous users
      select: false, // Don't return password by default
    },
    anonymousId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'root'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ anonymousId: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
