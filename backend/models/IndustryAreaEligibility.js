const mongoose = require('mongoose');

const industryAreaEligibilitySchema = new mongoose.Schema({
  state: { 
    type: String, 
    required: [true, 'State is required'], 
    index: true 
  },
  district: { 
    type: String, 
    required: [true, 'District is required'], 
    index: true 
  },
  industrialArea: { 
    type: String, 
    required: [true, 'Industrial Area name is required'] 
  },
  category: { 
    type: String, 
    enum: ['RED', 'ORANGE', 'GREEN', 'WHITE'], 
    required: [true, 'Pollution category is required'],
    index: true 
  },
  industryType: { 
    type: [String], 
    default: [] 
  },
  eligibilityStatus: { 
    type: String, 
    enum: ['Allowed', 'Restricted', 'Conditional', 'Verification Required'], 
    default: 'Allowed' 
  },
  conditions: { 
    type: String, 
    required: [true, 'Statutory siting conditions are required'] 
  },
  authority: { 
    type: String, 
    required: [true, 'Regulatory authority/SPCB is required'] 
  },
  sourceUrl: { 
    type: String, 
    default: '' 
  },
  sourceTitle: { 
    type: String, 
    required: [true, 'Official regulatory source title is required'] 
  },
  lastVerifiedAt: { 
    type: Date, 
    default: Date.now,
    required: true 
  },
  latitude: { 
    type: Number, 
    default: null 
  },
  longitude: { 
    type: Number, 
    default: null 
  },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  isVerified: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Compound index for fast state+district+category lookups
industryAreaEligibilitySchema.index({ state: 1, district: 1, category: 1 });

module.exports = mongoose.model('IndustryAreaEligibility', industryAreaEligibilitySchema);
