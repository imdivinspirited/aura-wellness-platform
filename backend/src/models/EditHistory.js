import mongoose from 'mongoose';

const ChangeSchema = new mongoose.Schema(
  {
    componentId: String,
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EditHistorySchema = new mongoose.Schema(
  {
    pageId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    changes: { type: [ChangeSchema], default: [] },
    snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
    editedBy: { type: String, default: null },
    editedAt: { type: Date, default: Date.now },
    description: { type: String, default: '' },
  },
  { timestamps: true, collection: 'edit_histories' }
);

EditHistorySchema.index({ pageId: 1, version: -1 });

export const EditHistoryModel =
  mongoose.models.EditHistory || mongoose.model('EditHistory', EditHistorySchema);
