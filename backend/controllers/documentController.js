const mongoose = require('mongoose');
const DocumentRecord = require('../models/DocumentRecord');

// Pre-seeded database records for verified statutory documents
const SEED_DOCUMENT_RECORDS = [
  {
    documentId: 'doc-pan',
    documentType: 'PAN Card / Business PAN',
    name: 'PAN Card / Business PAN',
    category: 'Business Identity',
    status: 'APPROVED',
    metadata: { authority: 'Income Tax Department', verificationSource: 'CBDT PAN Verification API' }
  },
  {
    documentId: 'doc-aadhaar',
    documentType: 'Aadhaar / Identity Proof',
    name: 'Aadhaar / Identity Proof',
    category: 'Signatory KYC',
    status: 'APPROVED',
    metadata: { authority: 'UIDAI', verificationSource: 'Aadhaar e-KYC Vault' }
  },
  {
    documentId: 'doc-reg',
    documentType: 'Business Registration Certificate',
    name: 'Business Registration Certificate',
    category: 'Corporate Entity',
    status: 'APPROVED',
    metadata: { authority: 'Ministry of Corporate Affairs (MCA)', verificationSource: 'MCA21 Database' }
  },
  {
    documentId: 'doc-land',
    documentType: 'Land Ownership / Lease Documents',
    name: 'Land Ownership / Lease Documents',
    category: 'Property & Land',
    status: 'APPROVED',
    metadata: { authority: 'MIDC / Revenue Department', verificationSource: 'Bhulekh 7/12 Land Registry' }
  },
  {
    documentId: 'doc-building',
    documentType: 'Building Layout / Site Plan',
    name: 'Building Layout / Site Plan',
    category: 'Engineering',
    status: 'APPROVED',
    metadata: { authority: 'Planning Authority / Directorate of Town Planning', verificationSource: 'BPAMS Portal' }
  },
  {
    documentId: 'doc-machinery',
    documentType: 'Machinery Details',
    name: 'Machinery Details',
    category: 'Technical Equipment',
    status: 'APPROVED',
    metadata: { authority: 'DISH / Chief Inspector of Boilers', verificationSource: 'Technical Safety Registry' }
  }
];

// Fallback in-memory database store for running in demo mode or when MongoDB is offline
let memoryRecords = [...SEED_DOCUMENT_RECORDS];

/**
 * Ensures demo document records exist in MongoDB when connected
 */
async function ensureDemoDocumentRecords() {
  if (mongoose.connection.readyState === 1) {
    try {
      for (const rec of SEED_DOCUMENT_RECORDS) {
        const existing = await DocumentRecord.findOne({ documentId: rec.documentId });
        if (!existing) {
          await DocumentRecord.create(rec);
        }
      }
      console.log('MongoDB: Document approval records verified and loaded.');
    } catch (err) {
      console.warn('Could not seed DocumentRecord into MongoDB:', err.message);
    }
  }
}

/**
 * Validates an uploaded document against the database:
 * 1. Get uploaded document ID, document type, application/user ID.
 * 2. Check database for corresponding document record.
 * 3. If matching record exists:
 *    - Set status = APPROVED
 *    - Show status badge: APPROVED
 * 4. If no matching record exists:
 *    - Set status = REJECTED
 *    - Show status badge: REJECTED
 */
async function validateDocument(req, res) {
  try {
    const { documentId, documentType, applicationId, userId } = req.body || {};

    if (!documentId && !documentType) {
      return res.status(400).json({
        success: false,
        message: 'documentId or documentType is required for database validation'
      });
    }

    let matchingRecord = null;

    // 1. If MongoDB is connected (readyState === 1), query DocumentRecord collection
    if (mongoose.connection.readyState === 1) {
      const query = {
        $or: [
          ...(documentId ? [{ documentId }] : []),
          ...(documentType ? [{ documentType }] : [])
        ]
      };

      // If user/app specific records exist, prefer them, or fallback to general master record
      const candidates = await DocumentRecord.find(query);
      if (candidates && candidates.length > 0) {
        matchingRecord = candidates.find(c =>
          (userId && c.userId === userId) ||
          (applicationId && c.applicationId === applicationId)
        ) || candidates[0];
      }
    } else {
      // 2. Fallback in-memory store
      matchingRecord = memoryRecords.find(rec =>
        (documentId && rec.documentId === documentId) ||
        (documentType && rec.documentType.toLowerCase() === documentType.toLowerCase()) ||
        (documentType && rec.name.toLowerCase() === documentType.toLowerCase())
      ) || null;
    }

    // 3. Status determination based on database record existence:
    // Database record exists -> APPROVED
    // Database record does not exist -> REJECTED
    const recordExists = Boolean(matchingRecord && matchingRecord.status === 'APPROVED');
    const status = recordExists ? 'APPROVED' : 'REJECTED';
    const badge = status;

    return res.json({
      success: true,
      documentId: documentId || null,
      documentType: documentType || null,
      applicationId: applicationId || null,
      userId: userId || null,
      recordExists,
      status,
      badge,
      record: matchingRecord ? {
        documentId: matchingRecord.documentId,
        documentType: matchingRecord.documentType,
        name: matchingRecord.name,
        category: matchingRecord.category,
        status: matchingRecord.status,
        metadata: matchingRecord.metadata
      } : null,
      message: recordExists
        ? `Matching document record exists in database. Document approved.`
        : `No matching document record exists in database. Document rejected.`
    });
  } catch (error) {
    console.error('Error in validateDocument:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate document against database',
      error: error.message
    });
  }
}

/**
 * List all document records in database
 */
async function getRecords(req, res) {
  try {
    if (mongoose.connection.readyState === 1) {
      const records = await DocumentRecord.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: records.length, records });
    }
    return res.json({ success: true, count: memoryRecords.length, records: memoryRecords });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Add / register a document record in database
 */
async function addRecord(req, res) {
  try {
    const { documentId, documentType, name, category, status = 'APPROVED', userId, applicationId } = req.body;
    if (!documentId || !documentType) {
      return res.status(400).json({ success: false, message: 'documentId and documentType are required' });
    }

    const newRecord = {
      documentId,
      documentType,
      name: name || documentType,
      category: category || 'General',
      status: status.toUpperCase(),
      userId: userId || null,
      applicationId: applicationId || null,
      verifiedAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const created = await DocumentRecord.create(newRecord);
      return res.status(201).json({ success: true, record: created });
    }

    memoryRecords.push(newRecord);
    return res.status(201).json({ success: true, record: newRecord });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Delete a document record from database
 */
async function deleteRecord(req, res) {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      await DocumentRecord.findOneAndDelete({ $or: [{ _id: id }, { documentId: id }] });
    } else {
      memoryRecords = memoryRecords.filter(r => r.documentId !== id);
    }
    return res.json({ success: true, message: `Record ${id} removed from database` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  validateDocument,
  getRecords,
  addRecord,
  deleteRecord,
  ensureDemoDocumentRecords,
  SEED_DOCUMENT_RECORDS
};
