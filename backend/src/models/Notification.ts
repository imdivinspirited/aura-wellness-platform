/**
 * Notification Model
 *
 * MongoDB schema for notifications.
 */

import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'cart' | 'program' | 'registration';

export interface INotification extends Document {
  userId?: string;
  anonymousId?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      ref: 'User',
      index: true,
      sparse: true,
    },
    anonymousId: {
      type: String,
      index: true,
      sparse: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'cart', 'program', 'registration'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
    },
    actionLabel: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ anonymousId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
