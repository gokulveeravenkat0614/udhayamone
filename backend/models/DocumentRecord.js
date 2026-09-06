const mongoose = require('mongoose');

const documentRecordSchema = new mongoose.Schema({
  documentId: { type: String, required: true, index: true },
  documentType: { type: String, required: true },
  name: { type: String },
  category: { type: String },
  userId: { type: String, default: null },
  applicationId: { type: String, default: null },
  status: { type: String, enum: ['APPROVED', 'REJECTED'], default: 'APPROVED' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  verifiedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DocumentRecord', documentRecordSchema);
