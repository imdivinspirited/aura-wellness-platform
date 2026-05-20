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
  status: 'active' | 'deactivated' | 'deleted';
  deactivatedAt?: Date;
  deletedAt?: Date;
  oauth?: {
    googleId?: string;
    facebookId?: string;
    githubId?: string;
    appleSub?: string;
  };
  /**
   * Legacy single-role field (kept for backward compatibility).
   * Prefer `roles` going forward.
   */
  role: 'user' | 'admin' | 'root';
  /**
   * RBAC roles used across admin modules.
   * Examples: super_admin, hr, service, shop, finance, admin, root, user
   */
  roles: string[];
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
    status: {
      type: String,
      enum: ['active', 'deactivated', 'deleted'],
      default: 'active',
      index: true,
    },
    deactivatedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    oauth: {
      googleId: { type: String, index: true, sparse: true },
      facebookId: { type: String, index: true, sparse: true },
      githubId: { type: String, index: true, sparse: true },
      appleSub: { type: String, index: true, sparse: true },
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'root'],
      default: 'user',
    },
    roles: {
      type: [String],
      default: ['user'],
      index: true,
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

// Keep `roles` consistent with legacy `role`
userSchema.pre('save', function (next) {
  if (!Array.isArray(this.roles) || this.roles.length === 0) {
    this.roles = [this.role || 'user'];
  }
  // Ensure legacy role is always represented
  if (this.role && !this.roles.includes(this.role)) {
    this.roles.push(this.role);
  }
  next();
});

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
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ anonymousId: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
