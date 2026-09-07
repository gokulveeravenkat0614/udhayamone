/**
 * Verification Validation Service
 * Enforces business rules for the identity verification flow:
 * 1. Blocks proceeding to Selfie if no valid document is uploaded
 * 2. Blocks proceeding while upload is in progress
 * 3. Blocks proceeding if document upload failed
 * 4. Protects the Selfie route against direct URL entry or refresh without an uploaded document
 */

export const SUPPORTED_DOCUMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg'
];

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Validates document file properties (existence, non-empty, supported MIME, size limit)
 */
export function validateDocumentUpload(fileOrBlob) {
  if (!fileOrBlob) {
    return {
      valid: false,
      error: "Please upload your identity document before continuing."
    };
  }

  if (!fileOrBlob.size || fileOrBlob.size === 0) {
    return {
      valid: false,
      error: "Uploaded document file is empty. Please upload a valid identity document."
    };
  }

  const mime = (fileOrBlob.type || '').toLowerCase();
  if (mime && !SUPPORTED_DOCUMENT_MIME_TYPES.includes(mime) && !mime.startsWith('image/')) {
    return {
      valid: false,
      error: "Unsupported document type. Please upload a JPEG, PNG, or WEBP image."
    };
  }

  if (fileOrBlob.size > MAX_DOCUMENT_SIZE_BYTES) {
    return {
      valid: false,
      error: "Document exceeds 10MB limit. Please upload a smaller image file."
    };
  }

  return {
    valid: true,
    error: null
  };
}

/**
 * Evaluates whether the user can move from Documents (Step 1) to Selfie (Step 2)
 */
export function canProceedToSelfie({
  documentFile,
  documentUploadInProgress = false,
  documentUploadFailed = false,
  documentUploadError = ''
}) {
  if (documentUploadFailed) {
    return {
      canProceed: false,
      error: documentUploadError || "Document upload failed. Please upload again."
    };
  }

  if (documentUploadInProgress) {
    return {
      canProceed: false,
      error: "Please wait for the document upload to complete."
    };
  }

  if (!documentFile) {
    return {
      canProceed: false,
      error: "Please upload your identity document before continuing."
    };
  }

  const fileValidation = validateDocumentUpload(documentFile);
  if (!fileValidation.valid) {
    return {
      canProceed: false,
      error: fileValidation.error
    };
  }

  return {
    canProceed: true,
    error: null
  };
}

/**
 * Direct Route Protection: validates whether the Selfie step or route can be opened
 */
export function canOpenSelfieRoute({ documentFile }) {
  if (!documentFile) {
    return {
      allowed: false,
      redirectTo: '/verify',
      error: "Please upload your identity document first."
    };
  }

  const fileValidation = validateDocumentUpload(documentFile);
  if (!fileValidation.valid) {
    return {
      allowed: false,
      redirectTo: '/verify',
      error: fileValidation.error
    };
  }

  return {
    allowed: true,
    redirectTo: null,
    error: null
  };
}

/**
 * Evaluates whether the user can move from Selfie (Step 2) to AI Analysis (Step 3)
 */
export function canProceedToAnalysis({ documentFile, selfieFile }) {
  if (!documentFile) {
    return {
      canProceed: false,
      redirectTo: '/verify',
      error: "Please upload your identity document first."
    };
  }

  if (!selfieFile) {
    return {
      canProceed: false,
      redirectTo: '/verify/selfie',
      error: "Please capture or upload your selfie before proceeding."
    };
  }

  return {
    canProceed: true,
    redirectTo: null,
    error: null
  };
}