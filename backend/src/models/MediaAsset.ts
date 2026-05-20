/**
 * Media Asset Model (S3-backed)
 *
 * Tracks uploaded images/documents/videos metadata and CDN URLs.
 * Uploads are performed via presigned URLs.
 */

import mongoose, { Document, Schema } from 'mongoose';

export type MediaKind = 'image' | 'document' | 'video_embed';

export interface IMediaVariant {
  format: 'avif' | 'webp' | 'jpeg' | 'png' | 'pdf';
  width?: number;
  height?: number;
  url: string;
  s3Key?: string;
  sizeBytes?: number;
}

export interface IMediaAsset extends Document {
  kind: MediaKind;
  title?: string;
  alt?: string;
  tags: string[];
  contentType?: string;
  sizeBytes?: number;
  originalFileName?: string;
  s3Bucket?: string;
  s3Key?: string;
  cdnUrl?: string;
  variants: IMediaVariant[];
  youtubeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaVariantSchema = new Schema<IMediaVariant>(
  {
    format: { type: String, enum: ['avif', 'webp', 'jpeg', 'png', 'pdf'], required: true },
    width: { type: Number },
    height: { type: Number },
    url: { type: String, required: true },
    s3Key: { type: String },
    sizeBytes: { type: Number },
  },
  { _id: false }
);

const mediaAssetSchema = new Schema<IMediaAsset>(
  {
    kind: { type: String, enum: ['image', 'document', 'video_embed'], required: true, index: true },
    title: { type: String, trim: true },
    alt: { type: String, trim: true },
    tags: { type: [String], default: [], index: true },
    contentType: { type: String },
    sizeBytes: { type: Number },
    originalFileName: { type: String },
    s3Bucket: { type: String, index: true },
    s3Key: { type: String, index: true },
    cdnUrl: { type: String },
    variants: { type: [mediaVariantSchema], default: [] },
    youtubeUrl: { type: String },
  },
  { timestamps: true }
);

mediaAssetSchema.index({ createdAt: -1 });
mediaAssetSchema.index({ kind: 1, createdAt: -1 });

export const MediaAsset = mongoose.model<IMediaAsset>('MediaAsset', mediaAssetSchema);

