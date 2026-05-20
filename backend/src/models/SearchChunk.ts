import mongoose, { Document, Schema } from 'mongoose';

export type SearchDocType = 'page' | 'program' | 'event' | 'service';

export interface ISearchChunk extends Document {
  docType: SearchDocType;
  docId: string;
  chunkIndex: number;
  title: string;
  url: string;
  language: string;
  text: string;
  embedding: number[];
  updatedAt: Date;
  createdAt: Date;
}

const searchChunkSchema = new Schema<ISearchChunk>(
  {
    docType: { type: String, enum: ['page', 'program', 'event', 'service'], required: true, index: true },
    docId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    title: { type: String, required: true, trim: true, index: true },
    url: { type: String, required: true, trim: true },
    language: { type: String, default: 'en', index: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true, default: [] },
  },
  { timestamps: true }
);

searchChunkSchema.index({ docType: 1, docId: 1, chunkIndex: 1 }, { unique: true });
searchChunkSchema.index({ language: 1, updatedAt: -1 });

export const SearchChunk = mongoose.model<ISearchChunk>('SearchChunk', searchChunkSchema);

