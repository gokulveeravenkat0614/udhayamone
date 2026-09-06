import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  XCircle,
  Download, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  FileCheck,
  Check,
  X,
  Database,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { applicationApi } from '../services/api';

const formatDisplayFileSize = (fileSize) => {
  if (!fileSize) return '';
  if (typeof fileSize === 'number') {
    return fileSize < 1024 * 1024 
      ? `${(fileSize / 1024).toFixed(1)} KB` 
      : `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (typeof fileSize === 'string') {
    if (!isNaN(Number(fileSize)) && !fileSize.includes(' ') && !fileSize.toLowerCase().includes('b')) {
      const num = Number(fileSize);
      return num < 1024 * 1024 
        ? `${(num / 1024).toFixed(1)} KB` 
        : `${(num / (1024 * 1024)).toFixed(1)} MB`;
    }
    return fileSize;
  }
  return '';
};

export const DocumentChecklist = ({ 
  documents = [], 
  onDocumentsUpdated,
  applicationId = null,
  userId = null
}) => {
  const [docsList, setDocsList] = useState(documents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'not_found', 'network', 'auth'
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'approved', 'rejected', 'not_uploaded'
  const [sessionToast, setSessionToast] = useState('');
  const [toastType, setToastType] = useState('info'); // 'info', 'success', 'error'
  const fileInputRef = useRef(null);
  const [activeUploadDocId, setActiveUploadDocId] = useState(null);

  // Load documents from backend API when applicationId is provided
  const loadDocuments = useCallback(async () => {
    if (!applicationId) {
      setDocsList(documents || []);
      setError(null);
      setErrorType(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setErrorType(null);
      const res = await applicationApi.getDocuments(applicationId);
      const data = res?.data || res;

      const realDocuments = Array.isArray(data)
        ? data
        : Array.isArray(data?.documents)
          ? data.documents
          : [];

      setDocsList(realDocuments);
      setError(null);
      setErrorType(null);
      if (onDocumentsUpdated) {
        onDocumentsUpdated(realDocuments);
      }
    } catch (err) {
      console.error('Failed to load documents from backend API:', err);

      const status = err.status || err.response?.status;
      const isAuth = status === 401 || err.message?.includes('Authentication required') || err.message?.includes('token') || err.message?.includes('expired');
      const isAppNotFound = err.isApplicationNotFound || (status === 404 && err.response?.data?.message === 'Application not found');

      if (isAuth) {
        setError("Session expired. Please log in again.");
        setErrorType('auth');
        setDocsList([]);
      } else if (isAppNotFound) {
        setError("Application not found.");
        setErrorType('not_found');
        setDocsList([]);
      } else {
        // Network errors, server 500, HTML 404 from static CDN, etc.
        setError("Unable to connect to application service.");
        setErrorType('network');
        // Preserve evaluated documents if available
        if (documents && documents.length > 0) {
          setDocsList(documents);
        } else {
          setDocsList([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [applicationId, documents, onDocumentsUpdated]);

  useEffect(() => {
    if (applicationId) {
      loadDocuments();
    }
  }, [applicationId, loadDocuments]);

  // Synchronize with parent props during render if no active error and applicationId didn't fetch yet
  const [prevDocuments, setPrevDocuments] = useState(documents);
  if (documents !== prevDocuments) {
    setPrevDocuments(documents);
    if (!applicationId) {
      setDocsList(documents);
    }
  }

  const totalCount = docsList.length;
  const approvedCount = docsList.filter(d => d.status === 'APPROVED' || d.status === 'VERIFIED').length;
  const rejectedCount = docsList.filter(d => d.status === 'REJECTED').length;
  const notUploadedCount = docsList.filter(d => d.status === 'NOT UPLOADED' || !d.fileName).length;
  const percentageApproved = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  // Real frontend file selection trigger (handles both initial upload & replace)
  const handleTriggerUpload = (docId) => {
    setActiveUploadDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * DATABASE VALIDATION FOR EVERY UPLOADED DOCUMENT:
   * Upload sends file directly to backend API which stores file and creates records in MongoDB.
   * Real matching MongoDB document record exists -> APPROVED.
   * Un-uploaded -> NOT UPLOADED.
   */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file && activeUploadDocId) {
      // Calculate formatted file size
      let formattedSize = "";
      if (file.size < 1024 * 1024) {
        formattedSize = `${(file.size / 1024).toFixed(1)} KB`;
      } else {
        formattedSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      const targetDoc = docsList.find(d => d.id === activeUploadDocId || d.documentId === activeUploadDocId);
      const documentId = targetDoc?.id || targetDoc?.documentId || activeUploadDocId;
      const documentType = targetDoc?.name || targetDoc?.documentType || targetDoc?.category || "Unknown";

      if (!applicationId) {
        setToastType('error');
        setSessionToast('Please select or submit an application before uploading documents.');
        setTimeout(() => setSessionToast(''), 4500);
        if (e.target) e.target.value = '';
        return;
      }

      try {
        const res = await applicationApi.uploadDocument(applicationId, {
          documentId,
          docId: documentId,
          documentType,
          docName: documentType,
          name: documentType,
          category: targetDoc?.category || '',
          whyRequired: targetDoc?.whyRequired || '',
          file,
          fileName: file.name,
          fileSize: formattedSize
        });

        if (res && res.success) {
          await loadDocuments();
          setToastType('success');
          setSessionToast(`APPROVED: "${file.name}" saved and verified against database record for ${documentType}.`);
          setTimeout(() => setSessionToast(''), 4500);
        } else {
          setToastType('error');
          setSessionToast(res?.message || `Failed to verify document for ${documentType}.`);
          setTimeout(() => setSessionToast(''), 4500);
        }
      } catch (err) {
        console.error('Backend upload API error:', err);
        setToastType('error');
        setSessionToast(err.message || `Upload failed for ${documentType}.`);
        setTimeout(() => setSessionToast(''), 4500);
      }
    }

    // Reset input so same file can be re-selected if replacing
    if (e.target) e.target.value = '';
  };

  // Delete uploaded file handler
  const handleDeleteFile = async (docId) => {
    const targetDoc = docsList.find(d => d.id === docId || d.documentId === docId);

    // Call backend API if applicationId is available
    if (applicationId) {
      try {
        await applicationApi.deleteDocument(applicationId, docId);
        await loadDocuments();
        setToastType('info');
        setSessionToast(`Removed file for "${targetDoc?.name || 'document'}". Status reset to NOT UPLOADED.`);
        setTimeout(() => setSessionToast(''), 3000);
        return;
      } catch (err) {
        console.warn('Backend delete API error:', err);
      }
    }

    const updated = docsList.map(doc => {
      if (doc.id === docId || doc.documentId === docId) {
        return {
          ...doc,
          status: "NOT UPLOADED",
          fileName: null,
          fileSize: null,
          fileType: null,
          uploadedAt: null,
          databaseRecordExists: false,
          validationMessage: null,
          reason: ''
        };
      }
      return doc;
    });

    setDocsList(updated);
    if (onDocumentsUpdated) {
      onDocumentsUpdated(updated);
    }
    setToastType('info');
    setSessionToast(`Removed file for "${targetDoc?.name || 'document'}". Status reset to NOT UPLOADED.`);
    setTimeout(() => setSessionToast(''), 3000);
  };

  // Download checklist text
  const handleDownloadChecklist = () => {
    const text = docsList.map(d => 
      `Requirement: ${d.name}\nCategory: ${d.category || 'General'}\nWhy required: ${d.whyRequired}\nStatus: ${d.status}\n${d.fileName ? `Uploaded file: ${d.fileName}${d.fileSize ? ` (${formatDisplayFileSize(d.fileSize)})` : ''}` : 'Not uploaded'}`
    ).join('\n\n--------------------------------------------\n\n');

    const header = `UDYAMONE INDUSTRIAL DOCUMENT PREPARATION CHECKLIST\nGenerated on: ${new Date().toLocaleDateString()}\nStatus: ${approvedCount} Approved, ${rejectedCount} Rejected, ${notUploadedCount} Not Uploaded\nCore Rule: Approved ONLY when matching document record exists in database\n=========================================================\n\n${text}\n\n* Note: Uploaded files are strictly verified against database document records.`;

    const blob = new Blob([header], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UdyamOne_Document_Approval_Checklist.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtering
  const filteredDocs = docsList.filter(doc => {
    if (activeFilter === 'approved') return doc.status === 'APPROVED' || doc.status === 'VERIFIED';
    if (activeFilter === 'rejected') return doc.status === 'REJECTED';
    if (activeFilter === 'not_uploaded') return doc.status === 'NOT UPLOADED' || !doc.fileName;
    return true;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold';
      case 'UPLOADED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'UNDER REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'NOT UPLOADED':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HTML5 File Input restricted to PDF, JPG, JPEG, PNG */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
      />

      {/* Session Feedback Toast */}
      {sessionToast && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xl animate-fadeIn transition-all ${
          toastType === 'success' 
            ? 'bg-emerald-950 text-emerald-100 border border-emerald-700' 
            : toastType === 'error'
              ? 'bg-rose-950 text-rose-100 border border-rose-700'
              : 'bg-slate-900 text-white border border-slate-700'
        }`}>
          <div className="flex items-center space-x-2.5">
            {toastType === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastType === 'error' ? (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{sessionToast}</span>
          </div>
          <button onClick={() => setSessionToast('')} className="text-slate-400 hover:text-white ml-3">✕</button>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-brand-800 text-xs font-bold mb-1.5">
              <FileCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Document Requirements & Approval System</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Statutory Document Approval
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Documents are <span className="font-bold text-emerald-700">APPROVED</span> only when a matching record exists in the database. Otherwise marked <span className="font-bold text-rose-700">REJECTED</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleDownloadChecklist}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Checklist</span>
            </button>
          </div>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Requirements</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{totalCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Approved (In DB)</span>
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-900 mt-1 block">{approvedCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Rejected (No DB)</span>
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-900 mt-1 block">{rejectedCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Not Uploaded</span>
            <span className="text-xl sm:text-2xl font-black text-slate-700 mt-1 block">{notUploadedCount}</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold text-slate-900">
                Approval Progress: {approvedCount} of {totalCount} verified against database
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {percentageApproved}% Approved
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Allowed formats: PDF, JPG, JPEG, PNG
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${percentageApproved}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Database Validation: Record exists → APPROVED • No record → REJECTED</span>
            </span>
            <span className="text-slate-400">Statutory verification active</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'all' 
                ? 'bg-slate-900 text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Requirements ({totalCount})
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'approved' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'rejected' 
                ? 'bg-rose-700 text-white shadow-2xs' 
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setActiveFilter('not_uploaded')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'not_uploaded' 
                ? 'bg-slate-700 text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Not Uploaded ({notUploadedCount})
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-6 py-16 text-center bg-slate-50/50 rounded-2xl border border-slate-200">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">Loading application...</h4>
            <p className="text-xs text-slate-500 mt-1">Retrieving verified statutory records from database</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mt-6 py-12 text-center bg-rose-50/40 rounded-2xl border border-rose-200 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">{error}</h4>
            
            {errorType === 'network' && (
              <>
                <p className="text-xs text-slate-600">Please check your connection and try again.</p>
                <button
                  onClick={loadDocuments}
                  className="px-4 py-2 rounded-xl bg-brand-700 text-white font-bold text-xs hover:bg-brand-800 transition-all cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </>
            )}

            {errorType === 'auth' && (
              <p className="text-xs text-slate-600">Session expired. Please log in again.</p>
            )}

            {errorType === 'not_found' && (
              <p className="text-xs text-slate-600">The requested application record could not be found in the database.</p>
            )}
          </div>
        )}

        {/* Application found but 0 requirements available */}
        {!loading && !error && totalCount === 0 && (
          <div className="mt-6 py-12 text-center bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Application found.</h4>
            <p className="text-xs font-semibold text-slate-600">0 requirements available.</p>
            <p className="text-[11px] text-slate-400">No statutory document requirements are registered for this profile.</p>
          </div>
        )}

        {/* DOCUMENT CARDS:
            Document card must show:
            - Document name
            - Category
            - Why required
            - File name
            - File size
            - Current status
            - Replace button
            - Delete button
        */}
        {!loading && !error && (
          <div className="mt-6 space-y-4">
            {filteredDocs.map((doc) => {
              const hasFile = Boolean(doc.fileName && doc.status !== 'NOT UPLOADED');
              const isApproved = doc.status === 'APPROVED' || doc.status === 'VERIFIED';
              const isRejected = doc.status === 'REJECTED';

              return (
                <div 
                  key={doc.id}
                  className={`p-5 rounded-2xl bg-white border transition-colors shadow-2xs ${
                    isApproved 
                      ? 'border-emerald-200 hover:border-emerald-300' 
                      : isRejected 
                        ? 'border-rose-200 hover:border-rose-300' 
                        : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Title with status icon */}
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isApproved
                            ? 'bg-emerald-600 text-white'
                            : isRejected
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-400 border border-slate-300'
                        }`}>
                          {isApproved ? (
                            <Check className="w-3 h-3 stroke-[3]" />
                          ) : isRejected ? (
                            <X className="w-3 h-3 stroke-[3]" />
                          ) : (
                            "○"
                          )}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {doc.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({doc.id})
                        </span>
                      </div>

                      {/* Category */}
                      <div className="text-xs text-slate-500 pl-7">
                        <span className="font-semibold text-slate-700">Category: </span>
                        {doc.category || 'General Identification'}
                      </div>

                      {/* Why required */}
                      <div className="text-xs text-slate-600 leading-relaxed pl-7 pt-1">
                        <span className="font-semibold text-slate-800">Why required: </span>
                        {doc.whyRequired}
                      </div>

                      {/* File Name & File Size (Shown strictly when real file is uploaded) */}
                      {hasFile && doc.fileName && (
                        <div className="mt-2.5 ml-7 flex flex-wrap items-center gap-2 pt-1">
                          <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                            isApproved 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}>
                            <FileText className={`w-4 h-4 shrink-0 ${isApproved ? 'text-emerald-600' : 'text-rose-600'}`} />
                            <span className="truncate max-w-[240px] font-bold">{doc.fileName}</span>
                            {doc.fileSize && (
                              <span className="font-normal opacity-80">• {formatDisplayFileSize(doc.fileSize)}</span>
                            )}
                          </div>

                          {/* Database record confirmation badge: only shown when actual database record confirms verification */}
                          <div className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500">
                            <Database className="w-3 h-3 text-slate-400" />
                            <span>
                              {isApproved && (doc.verified || doc.databaseRecordExists)
                                ? 'Record verified in database' 
                                : 'No matching database record'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status badge and Action buttons */}
                    <div className="sm:text-right shrink-0 pl-7 sm:pl-0 space-y-2.5">
                      {/* Current status badge */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block sm:inline mr-2">
                          Status:
                        </span>
                        <span className={`text-[10px] px-2.5 py-1 rounded-md border tracking-wider uppercase inline-flex items-center space-x-1 ${getStatusBadgeStyle(doc.status)}`}>
                          {isApproved && <Check className="w-3 h-3 mr-0.5" />}
                          {isRejected && <X className="w-3 h-3 mr-0.5" />}
                          <span>{doc.status}</span>
                        </span>
                      </div>

                      {/* Action buttons:
                          - If no file uploaded: Upload Document button
                          - If file uploaded: Replace button & Delete button
                      */}
                      <div>
                        {!hasFile ? (
                          <button
                            onClick={() => handleTriggerUpload(doc.id)}
                            className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Document</span>
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2 justify-end">
                            {/* Replace button */}
                            <button
                              onClick={() => handleTriggerUpload(doc.id)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                              title="Replace this uploaded document with another file"
                            >
                              <RefreshCw className="w-3 h-3 text-slate-500" />
                              <span>Replace</span>
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteFile(doc.id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
                              title="Delete this document and reset status"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              totalCount === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No documents uploaded yet.</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Required documents will appear here as you complete your application.
                  </p>
                  <button
                    onClick={() => handleTriggerUpload(null)}
                    className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  No documents found matching the "{activeFilter}" filter.
                </div>
              )
            )}
          </div>
        )}

      </div>

    </div>
  );
};
