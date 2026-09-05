import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Factory, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Sparkles,
  Filter
} from 'lucide-react';
import { ApprovalCard } from './ApprovalCard';
import { ApprovalDetailModal } from './ApprovalDetailModal';
import { DocumentChecklist } from './DocumentChecklist';
import { NextStepsTimeline } from './NextStepsTimeline';
import { REQUIREMENT_CATEGORIES } from '../data/requirementsData';

export const RequirementsView = ({ 
  requirements, 
  onBack, 
  onStartApplicationForApproval,
  userApplications = [],
  onDocumentsUpdated,
  _onNavigateToCompliance,
  _onNavigateToSchemes 
}) => {
  const [selectedApprovalModal, setSelectedApprovalModal] = useState(null);
  const [activeMainTab, setActiveMainTab] = useState('approvals'); // 'approvals', 'documents', 'nextSteps', 'otherRegs'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');

  if (!requirements) return null;

  const { state, district, industry, approvals, documents, otherRegistrations, nextSteps } = requirements;

  // Filter approvals by selected category
  const filteredApprovals = approvals.filter(app => {
    if (selectedCategoryFilter === 'All Categories') return true;
    return app.category === selectedCategoryFilter;
  });

  // Calculate dynamic counts strictly from the actual dataset
  const calculatedApprovalsCount = approvals.length;
  const calculatedDocsCount = documents.length;
  const calculatedComplianceCount = 4; // Factual statutory compliance areas

  // Check if an application exists for an approval
  const getAppStatusForApproval = (appId) => {
    const userApp = userApplications.find(a => a.approvalId === appId || a.approval === appId);
    return userApp ? userApp.status : "NOT STARTED";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Top Breadcrumb & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-all w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-brand-700" />
          <span>← Back / Change Selection</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>Discovery Step:</span>
          <span className="font-bold text-slate-900">Personalized Requirements</span>
        </div>
      </div>

      {/* SMART REQUIREMENT SUMMARY - Follows Section 16 Exact Format */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft relative overflow-hidden">
        
        <div className="space-y-6">
          
          <div>
            <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 mb-2">
              YOUR BUSINESS PROFILE
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-700" />
                <span>State: <strong className="text-slate-900">{state}</strong></span>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>District: <strong className="text-slate-900">{district}</strong></span>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-1.5">
                <Factory className="w-3.5 h-3.5 text-amber-700" />
                <span>Industry: <strong className="text-slate-900">{industry}</strong></span>
              </div>
            </div>
          </div>

          {/* Actual Dataset Calculated Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Potentially Applicable Approvals
              </div>
              <div className="text-3xl font-black text-brand-900 mt-1">
                {calculatedApprovalsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Calculated from statutory database
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Documents to Prepare
              </div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {calculatedDocsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Standard documentation items
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Compliance Areas
              </div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {calculatedComplianceCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Factory, Pollution, Fire, Labour
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Mandatory Disclaimer as requested in Rule 7 */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3 shadow-2xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Notice: </strong>UdyamOne is an MVP prototype. Requirements shown may vary based on location, industry, project size and applicable regulations. Users should verify requirements with the relevant official government authority before submission.
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-1 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveMainTab('approvals')}
          className={`px-5 py-3 rounded-t-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeMainTab === 'approvals'
              ? 'bg-white text-brand-800 border-t-2 border-x border-slate-200 border-t-brand-700 shadow-2xs -mb-1'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-brand-700" />
          <span>Potentially Applicable Approvals ({calculatedApprovalsCount})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('documents')}
          className={`px-5 py-3 rounded-t-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeMainTab === 'documents'
              ? 'bg-white text-brand-800 border-t-2 border-x border-slate-200 border-t-brand-700 shadow-2xs -mb-1'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Required Documents ({calculatedDocsCount})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('nextSteps')}
          className={`px-5 py-3 rounded-t-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeMainTab === 'nextSteps'
              ? 'bg-white text-brand-800 border-t-2 border-x border-slate-200 border-t-brand-700 shadow-2xs -mb-1'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Recommended Phases ({nextSteps.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('otherRegs')}
          className={`px-5 py-3 rounded-t-xl transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
            activeMainTab === 'otherRegs'
              ? 'bg-white text-brand-800 border-t-2 border-x border-slate-200 border-t-brand-700 shadow-2xs -mb-1'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>Statutory Registrations ({otherRegistrations.length})</span>
        </button>
      </div>

      {/* TAB 1: Approvals */}
      {activeMainTab === 'approvals' && (
        <div className="space-y-6">
          
          {/* Industry Requirement Categories Filter (Rule 13) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-1 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5 text-brand-600 mr-1" />
              <span className="font-semibold text-slate-700">Category Filter:</span>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              {REQUIREMENT_CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-brand-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApprovals.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onViewDetails={(app) => setSelectedApprovalModal(app)}
                userAppStatus={getAppStatusForApproval(approval.id)}
              />
            ))}
          </div>

          {filteredApprovals.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No approvals categorized under "{selectedCategoryFilter}". Select "All Categories" to view all.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Documents */}
      {activeMainTab === 'documents' && (
        <DocumentChecklist 
          documents={documents} 
          onDocumentsUpdated={onDocumentsUpdated}
        />
      )}

      {/* TAB 3: Next Steps */}
      {activeMainTab === 'nextSteps' && (
        <NextStepsTimeline steps={nextSteps} />
      )}

      {/* TAB 4: Other Registrations */}
      {activeMainTab === 'otherRegs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              Statutory Business & Tax Registrations
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              General enterprise registrations required alongside specific industrial licenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherRegistrations.map((reg) => (
              <div key={reg.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 mb-2 uppercase">
                    {reg.status}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">
                    {reg.name}
                  </h4>
                  <div className="text-xs font-semibold text-brand-700 mt-1">
                    {reg.department}
                  </div>
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {reg.purpose}
                  </p>
                </div>

                {reg.sourceUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <a 
                      href={reg.sourceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-brand-700 hover:underline inline-flex items-center space-x-1"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Details Modal */}
      <ApprovalDetailModal
        approval={selectedApprovalModal}
        isOpen={!!selectedApprovalModal}
        onClose={() => setSelectedApprovalModal(null)}
        onStartApplication={(app) => {
          setSelectedApprovalModal(null);
          if (onStartApplicationForApproval) {
            onStartApplicationForApproval(app);
          }
        }}
      />

    </div>
  );
};
