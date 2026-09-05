import React from 'react';
import { 
  X, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Download, 
  Landmark
} from 'lucide-react';

export const ApplicationTrackerModal = ({ application, isOpen, onClose }) => {
  if (!isOpen || !application) return null;

  const stageNames = [
    "Application Submitted",
    "Document Verification",
    "Department Review",
    "Inspection",
    "Approval"
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Under Review':
        return 'bg-blue-100 text-brand-800 border-blue-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const handleDownloadCertificate = () => {
    const certText = `GOVERNMENT INDUSTRIAL CLEARANCE CERTIFICATE\nUdyamOne Single-Window National Clearance Portal\n=======================================================\nApplication ID: ${application.id}\nApplicant: ${application.applicant}\nPromoter: ${application.promoter}\nFactory Location: ${application.location}\nClearance Granted: ${application.approval}\nIssuing Authority: ${application.department}\nCertificate No: ${application.certificateNumber || `UDYAM-CERT-${application.id}`}\nDate of Issue: ${application.stages?.[4]?.date || '24 Aug 2026'}\nStatus: STATUTORILY APPROVED & DIGITALLY VERIFIED\n=======================================================\nDigital Signature: Verified by Directorate Chief Inspector\nValidity: As per statutory provisions of relevant Act.`;

    const blob = new Blob([certText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificate_${application.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-india-navy text-white p-6 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-white/10 text-amber-300 border border-white/20">
              ID: {application.id}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(application.status)}`}>
              {application.status}
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {application.approval}
          </h2>

          <div className="mt-1.5 flex items-center space-x-2 text-xs text-blue-100">
            <Landmark className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{application.department}</span>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 sm:p-8 space-y-7 overflow-y-auto text-slate-700 text-sm">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Applicant:</span>
              <span className="font-bold text-slate-800 truncate block">{application.applicant}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Submission Date:</span>
              <span className="font-bold text-slate-800">{application.submissionDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Industry & Location:</span>
              <span className="font-bold text-slate-800 truncate block">{application.district}, {application.state}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Current Status:</span>
              <span className="font-bold text-brand-700">{application.status}</span>
            </div>
          </div>

          {/* Required Action Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-bold mb-0.5">Required Action:</strong>
              <span className="text-slate-700">{application.requiredAction}</span>
              {application.officerNotes && (
                <div className="mt-2 pt-2 border-t border-blue-200 text-brand-950 font-medium">
                  <strong>Officer Remarks: </strong>"{application.officerNotes}"
                </div>
              )}
            </div>
          </div>

          {/* 5-STAGE TIMELINE (Horizontal on desktop / Vertical on mobile) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Statutory Stage Progression
            </h4>

            {/* Desktop Horizontal View */}
            <div className="hidden md:block py-4 px-2">
              <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0" />
                <div 
                  className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-brand-600 transition-all duration-500 -z-0"
                  style={{ width: `${(application.currentStageIndex / (stageNames.length - 1)) * 92}%` }}
                />

                {stageNames.map((stName, idx) => {
                  const isPast = idx < application.currentStageIndex;
                  const isCurrent = idx === application.currentStageIndex;

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center text-center max-w-[120px]">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                        isPast 
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                          : isCurrent 
                          ? 'bg-brand-700 text-white ring-4 ring-blue-100 animate-pulse' 
                          : 'bg-white text-slate-400 border-2 border-slate-300'
                      }`}>
                        {isPast ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      <div className={`mt-2.5 text-[11px] leading-tight font-bold ${
                        isCurrent ? 'text-brand-800' : isPast ? 'text-slate-800' : 'text-slate-400'
                      }`}>
                        {stName}
                      </div>

                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {application.stages?.[idx]?.date || (isPast ? 'Cleared' : isCurrent ? 'Active' : 'Pending')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Vertical View */}
            <div className="md:hidden space-y-4 pl-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {stageNames.map((stName, idx) => {
                const isPast = idx < application.currentStageIndex;
                const isCurrent = idx === application.currentStageIndex;

                return (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[27px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isPast ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-brand-700 text-white animate-pulse' : 'bg-white border-2 border-slate-300 text-slate-400'
                    }`}>
                      {isPast ? '✓' : idx + 1}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isCurrent ? 'text-brand-800' : isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                        {stName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {application.stages?.[idx]?.remarks || (isPast ? 'Verified' : isCurrent ? 'Under active review' : 'Scheduled')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Submitted Documents Inspection */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-brand-700" />
              <span>Submitted Supporting Documents</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {application.submittedDocs?.map((doc, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {doc.status || 'Verified'}
                  </span>
                </div>
              )) || (
                <div className="text-xs text-slate-500">No documents attached.</div>
              )}
            </div>
          </div>

          {/* Certificate Generation Banner if Approved */}
          {application.status === 'Approved' && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Statutory Approval Certificate Issued
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    Cert No: {application.certificateNumber || 'MH-FNOC-2026-889-PUNE'}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    Digitally signed & verified with State Directorate seal
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadCertificate}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Certificate (PDF)</span>
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Powered by Single-Window Interoperability Protocol
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Tracker
          </button>
        </div>

      </div>
    </div>
  );
};
