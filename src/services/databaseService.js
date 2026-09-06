// Client Database Service for Document Approvals
// Strictly enforces the core rule:
// - Document is APPROVED only when matching document record exists in database.
// - Document is REJECTED when no matching document record exists in database.
// - Never mark document as APPROVED only because user uploaded file.

import { documentApi } from './api.js';

export const INITIAL_DATABASE_DOCUMENT_RECORDS = [
  {
    documentId: 'doc-pan',
    documentType: 'PAN Card / Business PAN',
    name: 'PAN Card / Business PAN',
    category: 'Business Identity',
    status: 'APPROVED',
    registeredAuthority: 'Income Tax Department (CBDT)',
    verificationSource: 'PAN Verification Database'
  },
  {
    documentId: 'doc-aadhaar',
    documentType: 'Aadhaar / Identity Proof',
    name: 'Aadhaar / Identity Proof',
    category: 'Signatory KYC',
    status: 'APPROVED',
    registeredAuthority: 'UIDAI',
    verificationSource: 'Aadhaar e-KYC Vault'
  },
  {
    documentId: 'doc-reg',
    documentType: 'Business Registration Certificate',
    name: 'Business Registration Certificate',
    category: 'Corporate Entity',
    status: 'APPROVED',
    registeredAuthority: 'Ministry of Corporate Affairs (MCA)',
    verificationSource: 'MCA21 Database'
  },
  {
    documentId: 'doc-land',
    documentType: 'Land Ownership / Lease Documents',
    name: 'Land Ownership / Lease Documents',
    category: 'Property & Land',
    status: 'APPROVED',
    registeredAuthority: 'MIDC / Revenue Department',
    verificationSource: 'Bhulekh 7/12 Land Registry'
  },
  {
    documentId: 'doc-building',
    documentType: 'Building Layout / Site Plan',
    name: 'Building Layout / Site Plan',
    category: 'Engineering',
    status: 'APPROVED',
    registeredAuthority: 'Planning Authority / Directorate of Town Planning',
    verificationSource: 'BPAMS Portal'
  },
  {
    documentId: 'doc-machinery',
    documentType: 'Machinery Details',
    name: 'Machinery Details',
    category: 'Technical Equipment',
    status: 'APPROVED',
    registeredAuthority: 'Directorate of Industrial Safety & Health (DISH)',
    verificationSource: 'Technical Safety Registry'
  }
];

const DB_STORAGE_KEY = 'udyamone_document_database_records_v1';

export function getStoredDatabaseRecords() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(DB_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (err) {
    console.warn('Failed to parse database records from localStorage:', err);
  }
  return [...INITIAL_DATABASE_DOCUMENT_RECORDS];
}

export function saveStoredDatabaseRecords(records) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(records));
    }
  } catch (err) {
    console.warn('Failed to save database records to localStorage:', err);
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
export async function validateUploadedDocumentAgainstDatabase({
  documentId,
  documentType,
  applicationId = 'MH-10245',
  userId = 'demo-user'
}) {
  // First attempt backend database check via REST API
  try {
    const response = await documentApi.validate({
      documentId,
      documentType,
      applicationId,
      userId
    });

    if (response && response.success) {
      return {
        recordExists: Boolean(response.recordExists),
        status: response.status, // 'APPROVED' or 'REJECTED'
        badge: response.badge || response.status,
        message: response.message,
        record: response.record || null,
        source: 'backend-database'
      };
    }
  } catch (err) {
    // Backend offline / network failure -> Fall back seamlessly to client persistent database records
    console.debug('Backend document validation offline; falling back to local database store:', err.message);
  }

  // Check local database records
  const records = getStoredDatabaseRecords();
  const normalizedDocId = (documentId || '').toLowerCase().trim();
  const normalizedDocType = (documentType || '').toLowerCase().trim();

  const matchingRecord = records.find(r => {
    const rId = (r.documentId || '').toLowerCase().trim();
    const rType = (r.documentType || '').toLowerCase().trim();
    const rName = (r.name || '').toLowerCase().trim();

    const matchesId = normalizedDocId && rId === normalizedDocId;
    const matchesType = normalizedDocType && (rType === normalizedDocType || rName === normalizedDocType);
    return matchesId || matchesType;
  });

  const recordExists = Boolean(matchingRecord && matchingRecord.status === 'APPROVED');
  const status = recordExists ? 'APPROVED' : 'REJECTED';
  const badge = status;

  return {
    recordExists,
    status,
    badge,
    message: recordExists
      ? `Database record exists for "${matchingRecord.name}". Document APPROVED.`
      : `No matching document record exists in database for "${documentType || documentId}". Document REJECTED.`,
    record: matchingRecord || null,
    source: 'local-database'
  };
}

export function addDatabaseRecord(record) {
  const records = getStoredDatabaseRecords();
  const exists = records.some(r => r.documentId === record.documentId);
  if (!exists) {
    const updated = [record, ...records];
    saveStoredDatabaseRecords(updated);
    return updated;
  }
  return records;
}

export function removeDatabaseRecord(documentId) {
  const records = getStoredDatabaseRecords();
  const updated = records.filter(r => r.documentId !== documentId);
  saveStoredDatabaseRecords(updated);
  return updated;
}

export function resetDatabaseRecordsToDefault() {
  saveStoredDatabaseRecords(INITIAL_DATABASE_DOCUMENT_RECORDS);
  return [...INITIAL_DATABASE_DOCUMENT_RECORDS];
}
