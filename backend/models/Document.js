const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  applicationId: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true, 
    index: true 
  },
  documentId: { 
    type: String, 
    required: true, 
    index: true 
  },
  documentType: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    default: '' 
  },
  whyRequired: { 
    type: String, 
    default: '' 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: String, 
    default: '' 
  },
  fileUrl: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['NOT_UPLOADED', 'UPLOADED', 'PENDING', 'APPROVED', 'REJECTED'], 
    default: 'PENDING' 
  },
  verified: { 
    type: Boolean, 
    default: false 
  },
  reason: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
