import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Building2, 
  FileCheck2, 
  ShieldAlert, 
  Factory, 
  Flame,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

export const NextStepsTimeline = ({ steps, _onExploreStep }) => {
  const [expandedStep, setExpandedStep] = useState(2); // default expand step 2 (In Progress)

  const iconMap = {
    Building2: Building2,
    FileCheck2: FileCheck2,
    ShieldAlert: ShieldAlert,
    Factory: Factory,
    Flame: Flame
  };

  const getBadgeStyle = (color) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'amber':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Smart Execution Roadmap</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">
            Recommended Next Steps
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Follow this optimized chronological sequence to minimize dependencies and prevent project delays.
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
          Sequenced 1 to {steps.length}
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="mt-8 relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-brand-600 before:via-blue-400 before:to-slate-200">
        {steps.map((item) => {
          const IconComp = iconMap[item.icon] || Building2;
          const isExpanded = expandedStep === item.step;

          return (
            <div key={item.step} className="relative group">
              
              {/* Step Circle Marker */}
              <div className={`absolute -left-[27px] sm:-left-[35px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-xs font-black shadow-md transition-transform group-hover:scale-110 ${
                item.badgeColor === 'emerald'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-100'
                  : item.badgeColor === 'amber'
                  ? 'bg-amber-500 text-white ring-2 ring-amber-100 animate-pulse'
                  : 'bg-brand-800 text-white ring-2 ring-blue-100'
              }`}>
                {item.step}
              </div>

              {/* Step Card */}
              <div className="bg-slate-50 hover:bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 transition-all hover:shadow-md">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-700 shrink-0 shadow-2xs">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {item.title}
                      </h4>
                      <div className="text-xs text-slate-500 font-medium">
                        {item.subtitle} • <span className="font-semibold text-slate-700">{item.agency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getBadgeStyle(item.badgeColor)}`}>
                      {item.badge}
                    </span>
                    <button
                      onClick={() => setExpandedStep(isExpanded ? null : item.step)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                      title={isExpanded ? "Collapse" : "Expand details"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Duration & Key Tip */}
                <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="flex items-center space-x-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Typical Tenure: <strong className="text-slate-700">{item.duration}</strong></span>
                  </span>
                </div>

                {/* Expanded Checklist */}
                {isExpanded && item.checklist && (
                  <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 space-y-2 animate-fadeIn">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Prerequisites & Deliverables
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.checklist.map((chk, i) => (
                        <div key={i} className="text-xs text-slate-700 flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{chk}</span>
                        </div>
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
