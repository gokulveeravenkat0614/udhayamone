/**
 * Document Checklist Helper Functions
 * Pure functions for document requirement state transitions, status counts,
 * client-side tab filtering, response parsing, and HTTP error classification.
 */

export const classifyDocumentError = (err) => {
  if (!err) {
    return {
      error: "Unable to load document requirements. Please try again.",
      errorType: "network"
    };
  }

  const status = err.status || err.response?.status;
  const errMsg = (err.message || '').toLowerCase();

  const isAuth = status === 401 || 
    errMsg.includes('authentication required') || 
    errMsg.includes('unauthorized') || 
    errMsg.includes('token') || 
    errMsg.includes('expired');

  const isForbidden = status === 403 || 
    errMsg.includes('permission') || 
    errMsg.includes('forbidden') || 
    errMsg.includes('access denied');

  const isAppNotFound = err.isApplicationNotFound || 
    status === 404 || 
    errMsg.includes('application not found');

  if (isAuth) {
    return {
      error: "Your session has expired. Please log in again.",
      errorType: "auth"
    };
  }

  if (isForbidden) {
    return {
      error: "You do not have permission to access this application.",
      errorType: "forbidden"
    };
  }

  if (isAppNotFound) {
    return {
      error: "Application not found.",
      errorType: "not_found"
    };
  }

  return {
    error: "Unable to load document requirements. Please try again.",
    errorType: "network"
  };
};

export const calculateDocumentStats = (docsList = []) => {
  const list = Array.isArray(docsList) ? docsList : [];
  const totalCount = list.length;
  const approvedCount = list.filter(d => d && (d.status === 'APPROVED' || d.status === 'VERIFIED')).length;
  const rejectedCount = list.filter(d => d && d.status === 'REJECTED').length;
  const notUploadedCount = list.filter(d => d && (d.status === 'NOT UPLOADED' || !d.fileName)).length;
  const percentageApproved = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  return {
    totalCount,
    approvedCount,
    rejectedCount,
    notUploadedCount,
    percentageApproved
  };
};

export const filterDocuments = (docsList = [], activeFilter = 'all') => {
  const list = Array.isArray(docsList) ? docsList : [];
  return list.filter(doc => {
    if (!doc) return false;
    if (activeFilter === 'approved') return doc.status === 'APPROVED' || doc.status === 'VERIFIED';
    if (activeFilter === 'rejected') return doc.status === 'REJECTED';
    if (activeFilter === 'not_uploaded') return doc.status === 'NOT UPLOADED' || !doc.fileName;
    return true; // 'all'
  });
};

export const extractDocumentsFromResponse = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.documents)) return res.documents;
  if (res.data) {
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.documents)) return res.data.documents;
  }
  return [];
};
