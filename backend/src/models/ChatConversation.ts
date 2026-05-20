import mongoose, { Document, Schema, Types } from 'mongoose';

export type ChatMode = 'platform' | 'global';

export interface IChatConversation extends Document {
  sessionId: string;
  userId?: Types.ObjectId;
  mode: ChatMode;
  title: string;
  startedAt: Date;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatConversationSchema = new Schema<IChatConversation>(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    mode: { type: String, enum: ['platform', 'global'], default: 'platform', index: true },
    title: { type: String, required: true, default: 'New conversation', trim: true },
    startedAt: { type: Date, default: () => new Date(), index: true },
    lastMessageAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true }
);

chatConversationSchema.index({ sessionId: 1, startedAt: -1 });

export const ChatConversation = mongoose.model<IChatConversation>('ChatConversation', chatConversationSchema);

