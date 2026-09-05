import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Building2, 
  FileCheck2, 
  ShieldAlert, 
  Factory, 
  Flame,
  Sparkles,
  Zap,
  Layers,
  ChevronRight
} from 'lucide-react';

export const RecommendedJourney = ({ 
  steps = [], 
  approvals = [],
  dependencyGraph,
  onViewApprovalDetails,
  onStartApplication 
}) => {
  const iconMap = {
    Building2: <Building2 className="w-5 h-5 text-brand-700" />,
    FileCheck2: <FileCheck2 className="w-5 h-5 text-blue-700" />,
    ShieldAlert: <ShieldAlert className="w-5 h-5 text-amber-600" />,
    Factory: <Factory className="w-5 h-5 text-rose-700" />,
    Flame: <Flame className="w-5 h-5 text-orange-600" />
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white/10 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimized Statutory Sequence</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Recommended Single-Window Approval Journey
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
              Based on dependency graph topological sorting, this chronological journey minimizes sequential delays by highlighting parallel submission tracks.
            </p>
          </div>

          <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-right">
            <div className="text-xs text-blue-200">Total Pipeline Duration</div>
            <div className="text-2xl font-black text-amber-300">60 - 90 Days</div>
            <div className="text-[11px] text-blue-200/80">With concurrent Stage 2 submissions</div>
          </div>
        </div>
      </div>

      {/* Concurrent Track Optimization Callout */}
      <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 text-xs flex items-start space-x-3">
        <Zap className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-indigo-900">Efficiency Tip (Parallel Tracks): </strong>
          Apply for <strong>Pollution Consent to Establish (CTE)</strong> and <strong>Provisional Fire NOC</strong> concurrently while final architectural plans are reviewed by the Town Planning Authority. Both departments evaluate digital drawings independently.
        </div>
      </div>

      {/* Chronological Steps Timeline */}
      <div className="space-y-4">
        {steps.map((stepItem, index) => {
          const stepIcon = iconMap[stepItem.icon] || <Clock className="w-5 h-5 text-brand-700" />;

          // Map step to matching approvals
          const relatedApprovals = approvals.filter(a => {
            if (stepItem.step === 2 && a.category === 'Land & Building') return true;
            if (stepItem.step === 3 && a.category === 'Environment') return true;
            if (stepItem.step === 4 && a.category === 'Factory / Labour') return true;
            if (stepItem.step === 5 && (a.category === 'Fire & Safety' || a.category === 'Electricity / Utilities')) return true;
            return false;
          });

          return (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-card-hover transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                <div className="flex items-start space-x-4">
                  {/* Step Number Circle */}
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <span className="text-base font-black text-brand-900">
                      0{stepItem.step}
                    </span>
                  </div>

                  {/* Step Description */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                        {stepItem.status || `Stage ${stepItem.step}`}
                      </span>
                      {stepItem.parallelTrack && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                          <Zap className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Parallel Track Available</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {stepItem.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {stepItem.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                      <span>Agency: <strong className="text-slate-800">{stepItem.agency}</strong></span>
                      <span>•</span>
                      <span>Timeline: <strong className="text-slate-800">{stepItem.duration}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Related Approvals Chips */}
                {relatedApprovals.length > 0 && (
                  <div className="shrink-0 flex flex-col items-end space-y-1.5 pt-2 md:pt-0">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Associated Clearances</span>
                    <div className="flex flex-wrap md:flex-col gap-1.5 items-end">
                      {relatedApprovals.map(app => (
                        <button
                          key={app.id}
                          onClick={() => onViewApprovalDetails && onViewApprovalDetails(app)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-800 hover:text-brand-800 text-xs font-semibold border border-slate-200 transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{app.name}</span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
