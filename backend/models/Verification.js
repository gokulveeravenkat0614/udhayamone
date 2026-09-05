const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  document1Path: String,
  document2Path: String,
  livePhotoPath: String,
  documentMatch: Boolean,
  dataMatch: Boolean,
  faceMatch: Boolean,
  confidenceScore: Number,
  status: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
  failureReason: String,
  aiDetails: mongoose.Schema.Types.Mixed,
  verifiedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Verification', verificationSchema);
