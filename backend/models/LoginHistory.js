const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loginTime: { type: Date, default: Date.now },
  verificationStatus: String,
  deviceInfo: String
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
