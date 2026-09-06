const mongoose = require('mongoose');
const DocumentRecord = require('../models/DocumentRecord');
const Document = require('../models/Document');

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

    // 1. If MongoDB is connected (readyState === 1), query DocumentRecord & Document collections
    if (mongoose.connection.readyState === 1) {
      const query = {
        $or: [
          ...(documentId ? [{ documentId }] : []),
          ...(documentType ? [{ documentType }, { name: documentType }] : [])
        ]
      };

      const candidates = await DocumentRecord.find(query);
      if (candidates && candidates.length > 0) {
        if (userId || applicationId) {
          matchingRecord = candidates.find(c => {
            const userMatches = !c.userId || (userId && c.userId.toString() === userId.toString());
            const appMatches = !c.applicationId || (applicationId && c.applicationId.toString() === applicationId.toString());
            return userMatches && appMatches;
          }) || null;
        } else {
          matchingRecord = candidates.find(c => !c.userId && !c.applicationId) || candidates[0];
        }
      }

      // Check Document collection for specific application and user
      if (!matchingRecord && (userId || applicationId) && documentId) {
        const docQuery = {
          documentId,
          ...(userId && mongoose.Types.ObjectId.isValid(userId) ? { userId } : {}),
          ...(applicationId ? { applicationId } : {}),
          status: 'APPROVED'
        };
        const doc = await Document.findOne(docQuery);
        if (doc) {
          matchingRecord = {
            documentId: doc.documentId,
            documentType: doc.documentType,
            name: doc.documentType,
            category: doc.category,
            status: 'APPROVED',
            metadata: { fileName: doc.fileName, fileSize: doc.fileSize }
          };
        }
      }
    } else {
      // 2. Fallback in-memory store
      matchingRecord = memoryRecords.find(rec => {
        const idMatches = (documentId && rec.documentId === documentId);
        const typeMatches = (documentType && (
          rec.documentType.toLowerCase() === documentType.toLowerCase() ||
          (rec.name && rec.name.toLowerCase() === documentType.toLowerCase())
        ));
        const reqMatches = idMatches || typeMatches;
        if (!reqMatches) return false;

        if (userId || applicationId) {
          const userMatches = !rec.userId || (userId && rec.userId.toString() === userId.toString());
          const appMatches = !rec.applicationId || (applicationId && rec.applicationId.toString() === applicationId.toString());
          return userMatches && appMatches;
        }
        return true;
      }) || null;
    }

    // 3. Status determination based on database record existence:
    // Real matching database record exists -> APPROVED
    // No matching database record exists -> REJECTED
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

function registerMemoryRecord(rec) {
  const idx = memoryRecords.findIndex(r => 
    r.documentId === rec.documentId && 
    ((rec.applicationId && r.applicationId === rec.applicationId) || (!rec.applicationId))
  );
  if (idx >= 0) memoryRecords[idx] = { ...memoryRecords[idx], ...rec };
  else memoryRecords.push(rec);
}

function removeMemoryRecord(documentId, applicationId, userId) {
  memoryRecords = memoryRecords.filter(r => 
    !(r.documentId === documentId && 
      (!applicationId || r.applicationId === applicationId) &&
      (!userId || r.userId === userId))
  );
}

module.exports = {
  validateDocument,
  getRecords,
  addRecord,
  deleteRecord,
  ensureDemoDocumentRecords,
  SEED_DOCUMENT_RECORDS,
  registerMemoryRecord,
  removeMemoryRecord
};
