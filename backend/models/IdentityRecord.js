const mongoose = require('mongoose');

const identityRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: String,
  dateOfBirth: String,
  identityReference: String,
  referencePhotoPath: String
}, { timestamps: true });

module.exports = mongoose.model('IdentityRecord', identityRecordSchema);
