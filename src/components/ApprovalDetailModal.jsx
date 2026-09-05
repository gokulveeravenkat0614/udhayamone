import React, { useEffect } from 'react';
import { 
  X, 
  Landmark, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

export const ApprovalDetailModal = ({ approval, isOpen, onClose, onStartApplication }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !approval) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">
            <span className="px-2 py-0.5 rounded bg-blue-500/30 border border-blue-400/30">
              {approval.category || 'Statutory Requirement'}
            </span>
            <span>•</span>
            <span className="text-amber-300">Status: {approval.status || 'CHECK APPLICABILITY'}</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white pr-10">
            {approval.name}
          </h2>

          <div className="mt-2.5 flex items-center space-x-2 text-xs sm:text-sm text-blue-100">
            <Landmark className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">{approval.authority || approval.department}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-slate-700 text-sm">
          
          {/* Applicability & Why required */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-brand-700" />
              <span>Statutory Applicability & Purpose</span>
            </h4>
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-slate-800 leading-relaxed font-normal text-xs sm:text-sm space-y-2">
              <p>
                <strong>Applicability: </strong>{approval.applicability}
              </p>
              <p className="text-slate-600">
                <strong>Why required: </strong>{approval.description}
              </p>
            </div>
          </div>

          {/* Official Source & Verification Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Statutory Reference / Source
              </div>
              <div className="mt-1 font-bold text-slate-800">
                {approval.officialSource || 'Official Government Source'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Verification Status
              </div>
              <div className="mt-1 font-bold text-emerald-700 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{approval.verificationStatus || 'Verified Framework'}</span>
              </div>
            </div>
          </div>

          {/* Procedural Stages */}
          {approval.stages && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-brand-700" />
                <span>Typical Procedural Steps</span>
              </h4>
              <div className="space-y-2 pl-2">
                {approval.stages.map((stage, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Required Documents Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-brand-700" />
              <span>Key Required Documents for this Clearance</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {approval.requiredDocs?.map((doc, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium truncate">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 italic">
            * Note: Procedural timelines and applicability vary according to actual project investment, connected electrical load, and specific government notifications. Verify with the concerned authority before applying.
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {approval.sourceUrl ? (
              <a
                href={approval.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white border border-brand-200 hover:border-brand-400 text-brand-700 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Official Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium border border-slate-200">
                Official source unavailable
              </span>
            )}

            <button
              onClick={() => {
                onClose();
                if (onStartApplication) {
                  onStartApplication(approval);
                }
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>Start Application (Demo)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
