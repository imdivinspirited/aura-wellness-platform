import mongoose, { Document, Schema, Types } from 'mongoose';

export type ChatRole = 'user' | 'assistant';
export type ChatDataSource = 'website' | 'global' | 'fallback' | 'greeting';

export interface IChatMessage extends Document {
  conversationId: Types.ObjectId;
  messageId: string;
  role: ChatRole;
  content: string;
  dataSource?: ChatDataSource;
  responseTimeMs?: number;
  suggestedQuestions?: string[];
  rating?: 1 | -1;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'ChatConversation', required: true, index: true },
    messageId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true, index: true },
    content: { type: String, required: true },
    dataSource: { type: String, enum: ['website', 'global', 'fallback', 'greeting'] },
    responseTimeMs: { type: Number, min: 0 },
    suggestedQuestions: { type: [String], default: [] },
    rating: { type: Number, enum: [1, -1] },
  },
  { timestamps: true }
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
chatMessageSchema.index({ messageId: 1 }, { unique: true });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);

