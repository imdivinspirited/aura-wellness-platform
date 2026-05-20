import mongoose from 'mongoose';

const ComponentBlockSchema = new mongoose.Schema(
  {
    componentId: { type: String, required: true },
    componentType: { type: String, required: true },
    props: { type: mongoose.Schema.Types.Mixed, default: {} },
    styles: { type: mongoose.Schema.Types.Mixed, default: {} },
    content: { type: mongoose.Schema.Types.Mixed, default: {} },
    children: { type: Array, default: [] },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const PageContentSchema = new mongoose.Schema(
  {
    pageId: { type: String, required: true, unique: true, index: true },
    pageUrl: { type: String, default: '' },
    components: { type: [ComponentBlockSchema], default: [] },
    version: { type: Number, default: 1 },
    lastEditedBy: { type: String, default: null },
    lastEditedAt: { type: Date, default: Date.now },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    publishedVersion: { type: Number, default: 0 },
  },
  { timestamps: true, collection: 'page_contents' }
);

export const PageContentModel =
  mongoose.models.PageContent || mongoose.model('PageContent', PageContentSchema);
