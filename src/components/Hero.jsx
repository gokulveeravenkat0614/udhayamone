import React from 'react';
import { 
  ArrowRight, 
  ChevronRight,
  Landmark,
  Info
} from 'lucide-react';

export const Hero = ({ onGetStarted, onExploreServices, onSelectPreset }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Honest Assistant Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-brand-900 text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-brand-600"></span>
              <span>Industrial Approval & Compliance Assistant</span>
              <span className="text-blue-300">|</span>
              <span className="text-brand-700 font-bold">Smart India Hackathon</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
              Start Your Industry <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-800 via-blue-600 to-indigo-700">
                Without the Confusion.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              UdyamOne helps entrepreneurs discover the approvals, licenses, documents and government services required to establish and operate their business.
            </p>

            {/* Quick Preset Chip */}
            <div className="p-3 bg-white rounded-2xl border border-blue-100 shadow-2xs flex flex-wrap items-center gap-2 justify-center lg:justify-start text-xs text-slate-600">
              <span className="font-semibold text-slate-900 flex items-center">
                <Info className="w-3.5 h-3.5 text-brand-600 mr-1" /> Quick Scenario:
              </span>
              <button
                onClick={() => onSelectPreset("Maharashtra", "Pune", "Manufacturing")}
                className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-800 hover:bg-brand-100 font-medium border border-brand-200 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <span>Maharashtra • Pune • Manufacturing</span>
                <ChevronRight className="w-3 h-3 text-brand-600" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-brand-800 to-blue-600 hover:from-brand-900 hover:to-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2.5 active:scale-95 cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onExploreServices}
                className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-700 hover:text-brand-800 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Explore Requirements</span>
              </button>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">Verified Sources</div>
                <div className="text-[11px] text-slate-500">Official statutory rules</div>
              </div>

              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">Dynamic Checklist</div>
                <div className="text-[11px] text-slate-500">Real in-session uploads</div>
              </div>

              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">Lifecycle Workflow</div>
                <div className="text-[11px] text-slate-500">Not Started → Submitted</div>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-200/90 relative z-10 space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-900 text-white flex items-center justify-center font-bold">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Statutory Requirement Mapper</div>
                    <div className="text-[10px] text-slate-500">State & Sectoral Clearances</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-700 border border-blue-200">
                  Assistant Guide
                </span>
              </div>

              {/* Sample Requirements list with honest "Check Applicability" status */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Factory Licence</div>
                    <div className="text-[10px] text-slate-500">Directorate of Industrial Safety & Health (DISH)</div>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Check Applicability
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Pollution Control Consent (CTE)</div>
                    <div className="text-[10px] text-slate-500">Maharashtra Pollution Control Board (MPCB)</div>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Check Applicability
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">Fire Safety No Objection Certificate</div>
                    <div className="text-[10px] text-slate-500">PMRDA Fire Department / MahaFire</div>
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Check Applicability
                  </span>
                </div>
              </div>

              {/* Document Readiness Card */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800">Document Readiness</span>
                  <span className="text-[11px] font-semibold text-slate-500">Uploaded for this session</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Start discovery to view required identity, property, and technical documents. Documents start as <strong>Not Uploaded</strong> until you upload them.
                </p>
              </div>

              {/* Advisory footnote */}
              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>Illustrative demonstration prototype</span>
                <span className="font-semibold text-brand-700 cursor-pointer" onClick={onGetStarted}>Try Wizard →</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
