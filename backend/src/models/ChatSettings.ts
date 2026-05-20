import mongoose, { Document, Schema } from 'mongoose';

export interface IChatSettings extends Document {
  sessionId: string;
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const chatSettingsSchema = new Schema<IChatSettings>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    preferences: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const ChatSettings = mongoose.model<IChatSettings>('ChatSettings', chatSettingsSchema);

