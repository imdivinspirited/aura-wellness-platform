import mongoose from 'mongoose';

/**
 * Visual editor pages — collection `pages`.
 * Each block is stored as `{ id, type, content }` (legacy `{ componentId, componentType, props }` is normalized on read).
 */
const PageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: '' },
    pageUrl: { type: String, default: '/' },
    blocks: { type: [mongoose.Schema.Types.Mixed], default: [] },
    version: { type: Number, default: 0 },
    lastEditedBy: { type: String, default: null },
  },
  { timestamps: true, collection: 'pages' }
);

export const PageModel = mongoose.models.Page || mongoose.model('Page', PageSchema);
