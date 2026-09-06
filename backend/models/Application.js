const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  applicationId: { type: String, required: true, unique: true, index: true },
  applicantName: { type: String, required: true, trim: true },
  promoter: { type: String, default: 'Authorized Signatory' },
  contactEmail: { type: String, default: null },
  contactPhone: { type: String, default: null },
  state: { type: String, required: true },
  district: { type: String, required: true },
  industry: { type: String, required: true },
  businessProfile: {
    entityType: { type: String, default: 'Private Limited Company' },
    investment: { type: Number, default: 2.5 },
    turnover: { type: Number, default: 12.0 },
    employeeCount: { type: Number, default: 25 },
    powerRequired: { type: Number, default: 75 },
    builtUpArea: { type: Number, default: 1500 },
    usesHazardousChemicals: { type: Boolean, default: false },
    isExportOriented: { type: Boolean, default: false }
  },
  msmeClassification: { type: mongoose.Schema.Types.Mixed, default: null },
  pollutionClassification: { type: mongoose.Schema.Types.Mixed, default: null },
  status: { type: String, enum: ['In Progress', 'Submitted', 'Completed'], default: 'In Progress' },
  progressPercentage: { type: Number, default: 25 },
  approvals: [{ type: mongoose.Schema.Types.Mixed }],
  approvalSequence: [{ type: mongoose.Schema.Types.Mixed }],
  dependencyGraph: { type: mongoose.Schema.Types.Mixed },
  documents: [{ type: mongoose.Schema.Types.Mixed }],
  timeline: [{
    event: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Completed' },
    remarks: { type: String, default: '' }
  }],
  certificateNumber: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
