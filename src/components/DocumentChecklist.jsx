import React, { useState, useRef, useEffect } from 'react';
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
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Plus,
  RotateCcw
} from 'lucide-react';
import { 
  validateUploadedDocumentAgainstDatabase,
  getStoredDatabaseRecords,
  addDatabaseRecord,
  removeDatabaseRecord,
  resetDatabaseRecordsToDefault
} from '../services/databaseService';

export const DocumentChecklist = ({ 
  documents = [], 
  onDocumentsUpdated,
  applicationId = 'MH-10245',
  userId = 'demo-user'
}) => {
  const [docsList, setDocsList] = useState(documents);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'approved', 'rejected', 'not_uploaded'
  const [sessionToast, setSessionToast] = useState('');
  const [toastType, setToastType] = useState('info'); // 'info', 'success', 'error'
  const fileInputRef = useRef(null);
  const [activeUploadDocId, setActiveUploadDocId] = useState(null);
  const [showDbRegistry, setShowDbRegistry] = useState(false);
  const [dbRecords, setDbRecords] = useState(() => getStoredDatabaseRecords());

  // Synchronize with parent props during render
  const [prevDocuments, setPrevDocuments] = useState(documents);
  if (documents !== prevDocuments) {
    setPrevDocuments(documents);
    setDocsList(documents);
  }

  // Refresh database records state
  const refreshDbRecords = () => {
    setDbRecords(getStoredDatabaseRecords());
  };

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
   * 1. Get uploaded document ID, document type, application/user ID.
   * 2. Check database for corresponding document record.
   * 3. If matching record exists:
   *    - Set status = APPROVED
   *    - Show status badge: APPROVED
   * 4. If no matching record exists:
   *    - Set status = REJECTED
   *    - Show status badge: REJECTED
   *
   * Core rule: Never mark document as APPROVED only because user uploaded file.
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

      const targetDoc = docsList.find(d => d.id === activeUploadDocId);

      // Step 1: Get uploaded document ID, document type, application/user ID
      const documentId = targetDoc?.id || activeUploadDocId;
      const documentType = targetDoc?.name || targetDoc?.category || "Unknown";
      const userOrAppId = applicationId || userId || "demo-user";

      // Step 2: Check database for corresponding document record
      const validationResult = await validateUploadedDocumentAgainstDatabase({
        documentId,
        documentType,
        applicationId: userOrAppId,
        userId: userOrAppId
      });

      // Step 3 & Step 4: Status behavior based strictly on database match
      // Database record exists -> APPROVED
      // Database record does not exist -> REJECTED
      const newStatus = validationResult.status; // 'APPROVED' or 'REJECTED'
      const recordMatched = validationResult.recordExists;

      const updated = docsList.map(doc => {
        if (doc.id === activeUploadDocId) {
          return {
            ...doc,
            status: newStatus,
            fileName: file.name,
            fileSize: formattedSize,
            fileType: file.type || "document",
            uploadedAt: new Date().toLocaleTimeString(),
            databaseRecordExists: recordMatched,
            validationMessage: validationResult.message,
            registeredAuthority: validationResult.record?.registeredAuthority || validationResult.record?.metadata?.authority || null
          };
        }
        return doc;
      });

      setDocsList(updated);
      if (onDocumentsUpdated) {
        onDocumentsUpdated(updated);
      }

      if (recordMatched) {
        setToastType('success');
        setSessionToast(`APPROVED: "${file.name}" verified against database record for ${documentType}.`);
      } else {
        setToastType('error');
        setSessionToast(`REJECTED: No corresponding document record exists in database for "${documentType}".`);
      }
      setTimeout(() => setSessionToast(''), 4500);
    }

    // Reset input so same file can be re-selected if replacing
    if (e.target) e.target.value = '';
  };

  // Delete uploaded file handler
  const handleDeleteFile = (docId) => {
    const targetDoc = docsList.find(d => d.id === docId);
    const updated = docsList.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: "NOT UPLOADED",
          fileName: null,
          fileSize: null,
          fileType: null,
          uploadedAt: null,
          databaseRecordExists: false,
          validationMessage: null
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

  // Toggle or add record in database registry for dynamic testing
  const handleToggleDbRecord = (doc) => {
    const isCurrentlyInDb = dbRecords.some(r => r.documentId === doc.id);
    if (isCurrentlyInDb) {
      removeDatabaseRecord(doc.id);
      refreshDbRecords();
      setToastType('info');
      setSessionToast(`Removed "${doc.name}" (${doc.id}) from database registry.`);
    } else {
      addDatabaseRecord({
        documentId: doc.id,
        documentType: doc.name,
        name: doc.name,
        category: doc.category || 'General',
        status: 'APPROVED',
        registeredAuthority: 'Statutory Registry'
      });
      refreshDbRecords();
      setToastType('success');
      setSessionToast(`Added "${doc.name}" (${doc.id}) to database registry.`);
    }
    setTimeout(() => setSessionToast(''), 3500);
  };

  const handleResetDbRegistry = () => {
    resetDatabaseRecordsToDefault();
    refreshDbRecords();
    setToastType('info');
    setSessionToast('Database document registry reset to default statutory records.');
    setTimeout(() => setSessionToast(''), 3500);
  };

  // Download checklist text
  const handleDownloadChecklist = () => {
    const text = docsList.map(d => 
      `Requirement: ${d.name}\nCategory: ${d.category || 'General'}\nWhy required: ${d.whyRequired}\nStatus: ${d.status}\n${d.fileName ? `Uploaded file: ${d.fileName} (${d.fileSize})` : 'Not uploaded'}`
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
              onClick={() => setShowDbRegistry(!showDbRegistry)}
              className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Inspect or manage database records"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span>DB Registry ({dbRecords.length})</span>
              {showDbRegistry ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              onClick={handleDownloadChecklist}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Checklist</span>
            </button>
          </div>
        </div>

        {/* Optional Collapsible Database Document Registry Inspector */}
        {showDbRegistry && (
          <div className="mt-5 p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 animate-fadeIn space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-indigo-700" />
                <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                  Database Records Registry (Active Database Verification Table)
                </h4>
              </div>
              <button
                onClick={handleResetDbRegistry}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold border border-indigo-200 cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default Records</span>
              </button>
            </div>
            
            <p className="text-[11px] text-indigo-900 leading-relaxed">
              When an uploaded document matches a record below, it is automatically marked <strong className="text-emerald-700 font-black">APPROVED</strong>. If no matching record exists in this table, it is marked <strong className="text-rose-700 font-black">REJECTED</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {docsList.map(doc => {
                const inDb = dbRecords.some(r => r.documentId === doc.id);
                return (
                  <div 
                    key={doc.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      inDb 
                        ? 'bg-white border-emerald-200 shadow-2xs' 
                        : 'bg-slate-50/80 border-slate-200 opacity-75'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-900 truncate text-[11px]">{doc.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{doc.id}</div>
                    </div>
                    <button
                      onClick={() => handleToggleDbRecord(doc)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                        inDb
                          ? 'bg-emerald-100 hover:bg-rose-100 text-emerald-800 hover:text-rose-700'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                      title={inDb ? 'Click to remove record (will cause rejection on upload)' : 'Click to register record in database'}
                    >
                      {inDb ? '✓ In DB (Active)' : '+ Add to DB'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
        <div className="mt-6 space-y-4">
          {filteredDocs.map((doc) => {
            const hasFile = Boolean(doc.fileName);
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

                    {/* File Name & File Size (Shown when file is uploaded) */}
                    {hasFile && (
                      <div className="mt-2.5 ml-7 flex flex-wrap items-center gap-2 pt-1">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                          isApproved 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}>
                          <FileText className={`w-4 h-4 shrink-0 ${isApproved ? 'text-emerald-600' : 'text-rose-600'}`} />
                          <span className="truncate max-w-[240px] font-bold">{doc.fileName}</span>
                          <span className="font-normal opacity-80">• {doc.fileSize}</span>
                        </div>

                        {/* Database record confirmation badge */}
                        <div className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-500">
                          <Database className="w-3 h-3 text-slate-400" />
                          <span>
                            {isApproved 
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
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No documents found matching the "{activeFilter}" filter.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
