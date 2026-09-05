import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Download, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  FileCheck,
  Check
} from 'lucide-react';

export const DocumentChecklist = ({ 
  documents = [], 
  onDocumentsUpdated 
}) => {
  const [docsList, setDocsList] = useState(documents);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sessionToast, setSessionToast] = useState('');
  const fileInputRef = useRef(null);
  const [activeUploadDocId, setActiveUploadDocId] = useState(null);

  // Synchronize with parent props during render
  const [prevDocuments, setPrevDocuments] = useState(documents);
  if (documents !== prevDocuments) {
    setPrevDocuments(documents);
    setDocsList(documents);
  }

  const totalCount = docsList.length;
  const uploadedCount = docsList.filter(d => d.status === 'UPLOADED' || d.status === 'VERIFIED').length;
  const percentageUploaded = totalCount > 0 ? Math.round((uploadedCount / totalCount) * 100) : 0;

  // Real frontend file selection handler
  const handleTriggerUpload = (docId) => {
    setActiveUploadDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && activeUploadDocId) {
      // Calculate actual file size
      let formattedSize = "";
      if (file.size < 1024 * 1024) {
        formattedSize = `${(file.size / 1024).toFixed(1)} KB`;
      } else {
        formattedSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      const updated = docsList.map(doc => {
        if (doc.id === activeUploadDocId) {
          return {
            ...doc,
            status: "UPLOADED", // Allowed states: NOT UPLOADED, UPLOADED, UNDER REVIEW, VERIFIED, REJECTED
            fileName: file.name,
            fileSize: formattedSize,
            fileType: file.type || "document",
            uploadedAt: new Date().toLocaleTimeString()
          };
        }
        return doc;
      });

      setDocsList(updated);
      if (onDocumentsUpdated) {
        onDocumentsUpdated(updated);
      }

      setSessionToast(`Uploaded "${file.name}" (${formattedSize}) for this session.`);
      setTimeout(() => setSessionToast(''), 4000);
    }
    // reset input
    if (e.target) e.target.value = '';
  };

  // Delete uploaded file handler
  const handleDeleteFile = (docId) => {
    const updated = docsList.map(doc => {
      if (doc.id === docId) {
        return {
          ...doc,
          status: "NOT UPLOADED",
          fileName: null,
          fileSize: null,
          fileType: null,
          uploadedAt: null
        };
      }
      return doc;
    });

    setDocsList(updated);
    if (onDocumentsUpdated) {
      onDocumentsUpdated(updated);
    }
    setSessionToast('File removed.');
    setTimeout(() => setSessionToast(''), 2500);
  };

  // Download checklist text
  const handleDownloadChecklist = () => {
    const text = docsList.map(d => 
      `Requirement: ${d.name}\nCategory: ${d.category || 'General'}\nWhy required: ${d.whyRequired}\nStatus: ${d.status}\n${d.fileName ? `Uploaded file: ${d.fileName} (${d.fileSize})` : 'Not uploaded'}`
    ).join('\n\n--------------------------------------------\n\n');

    const header = `UDYAMONE INDUSTRIAL DOCUMENT PREPARATION CHECKLIST\nGenerated on: ${new Date().toLocaleDateString()}\nStatus: ${uploadedCount} of ${totalCount} documents uploaded for this session\n=========================================================\n\n${text}\n\n* Note: Uploaded files are retained in local browser session memory for demonstration.`;

    const blob = new Blob([header], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UdyamOne_Document_Checklist.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocs = docsList.filter(doc => {
    if (activeFilter === 'uploaded') return doc.status === 'UPLOADED' || doc.status === 'VERIFIED';
    if (activeFilter === 'not_uploaded') return doc.status === 'NOT UPLOADED';
    return true;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'UPLOADED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UNDER REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'NOT UPLOADED':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Real HTML5 File Input restricted to PDF, JPG, JPEG, PNG as required in Rule 9 */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
      />

      {/* Session Feedback Toast */}
      {sessionToast && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{sessionToast}</span>
          </div>
          <button onClick={() => setSessionToast('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-brand-800 text-xs font-bold mb-1.5">
              <FileCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Document Requirements Checklist</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Documents You May Need
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Standard document requirements typically requested by statutory authorities for your sector.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-auto">
            <button
              onClick={handleDownloadChecklist}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Checklist</span>
            </button>
          </div>
        </div>

        {/* Real Dynamic Progress Bar */}
        <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center space-x-2.5">
              <span className="text-base font-extrabold text-slate-900">
                {uploadedCount} of {totalCount} documents uploaded
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-brand-800">
                {percentageUploaded}% Session Ready
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Allowed formats: PDF, JPG, JPEG, PNG
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${percentageUploaded}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Files are retained in your browser session memory for testing</span>
            </span>
            <span className="text-slate-400">Not transmitted to government servers</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex items-center space-x-2 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeFilter === 'all' 
                ? 'bg-slate-900 text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Requirements ({totalCount})
          </button>
          <button
            onClick={() => setActiveFilter('uploaded')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeFilter === 'uploaded' 
                ? 'bg-brand-700 text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Uploaded ({uploadedCount})
          </button>
          <button
            onClick={() => setActiveFilter('not_uploaded')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeFilter === 'not_uploaded' 
                ? 'bg-slate-700 text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Not Uploaded ({totalCount - uploadedCount})
          </button>
        </div>

        {/* Improved Document Cards - Follows Section 14 Exact Format */}
        <div className="mt-6 space-y-4">
          {filteredDocs.map((doc) => (
            <div 
              key={doc.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Title with check icon */}
                  <div className="flex items-center space-x-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      doc.status === 'UPLOADED' || doc.status === 'VERIFIED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-300'
                    }`}>
                      {doc.status === 'UPLOADED' || doc.status === 'VERIFIED' ? <Check className="w-3 h-3" /> : "○"}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      {doc.name}
                    </h4>
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

                  {/* Uploaded File Details (Only if user actually uploaded) */}
                  {doc.fileName && (
                    <div className="mt-2.5 ml-7 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-brand-900 text-xs font-semibold">
                      <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="truncate max-w-[240px]">{doc.fileName}</span>
                      <span className="text-brand-600 font-normal">• {doc.fileSize}</span>
                    </div>
                  )}
                </div>

                {/* Status and Action Buttons */}
                <div className="sm:text-right shrink-0 pl-7 sm:pl-0 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block sm:inline mr-2">
                      Status:
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border tracking-wider uppercase ${getStatusBadgeStyle(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>

                  {/* Upload, Replace, Delete Buttons */}
                  <div>
                    {doc.status === 'NOT UPLOADED' ? (
                      <button
                        onClick={() => handleTriggerUpload(doc.id)}
                        className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Document</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2 justify-end">
                        <button
                          onClick={() => handleTriggerUpload(doc.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-500" />
                          <span>Replace</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFile(doc.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
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
          ))}

          {filteredDocs.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No documents found in this filter.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
