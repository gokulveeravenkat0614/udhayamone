const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  verificationStatus: { type: String, enum: ['not_verified', 'pending', 'verified', 'failed'], default: 'not_verified' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
