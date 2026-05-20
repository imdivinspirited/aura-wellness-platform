/**
 * Page Model (CMS)
 *
 * Stores page structure as ordered sections (Elementor-style).
 * Rendering is driven from this model, enabling live updates without redeploy.
 */

import mongoose, { Document, Schema } from 'mongoose';

export type PageStatus = 'draft' | 'published';

export type PageSectionType =
  | 'hero'
  | 'rich_text'
  | 'image'
  | 'gallery'
  | 'cta'
  | 'faq'
  | 'program_list'
  | 'event_list';

export interface IPageSection {
  sectionId: string;
  type: PageSectionType;
  order: number;
  props: Record<string, unknown>;
}

export interface IPage extends Document {
  slug: string;
  title: string;
  description?: string;
  status: PageStatus;
  language: string;
  sections: IPageSection[];
  createdAt: Date;
  updatedAt: Date;
}

const pageSectionSchema = new Schema<IPageSection>(
  {
    sectionId: { type: String, required: true },
    type: {
      type: String,
      enum: ['hero', 'rich_text', 'image', 'gallery', 'cta', 'faq', 'program_list', 'event_list'],
      required: true,
      index: true,
    },
    order: { type: Number, required: true, index: true },
    props: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const pageSchema = new Schema<IPage>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    language: { type: String, default: 'en', index: true },
    sections: { type: [pageSectionSchema], default: [] },
  },
  { timestamps: true }
);

pageSchema.index({ status: 1, language: 1 });
pageSchema.index({ slug: 1, status: 1 });

export const Page = mongoose.model<IPage>('Page', pageSchema);

