import React, { useState, useRef, useEffect } from 'react';
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
  Filter,
  GitBranch,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
  Briefcase,
  Zap,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { ApprovalCard } from './ApprovalCard';
import { ApprovalDetailModal } from './ApprovalDetailModal';
import { DocumentChecklist } from './DocumentChecklist';
import { NextStepsTimeline } from './NextStepsTimeline';
import { DependencyGraph } from './DependencyGraph';
import { RecommendedJourney } from './RecommendedJourney';
import { REQUIREMENT_CATEGORIES } from '../data/requirementsData';
import { useTranslation } from '../i18n/LanguageContext';

export const RequirementsView = ({ 
  requirements, 
  onBack, 
  onStartApplicationForApproval,
  userApplications = [],
  onDocumentsUpdated,
  _onNavigateToCompliance,
  _onNavigateToSchemes 
}) => {
  const { t } = useTranslation();
  const [selectedApprovalModal, setSelectedApprovalModal] = useState(null);
  // Main tabs: 'approvals', 'graph', 'journey', 'exemptions', 'documents', 'otherRegs'
  const [activeMainTab, setActiveMainTab] = useState('approvals');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Categories');
  const approvalsSectionRef = useRef(null);

  // Directly land on the section where required government approvals, certificates, licenses, NOCs are listed
  useEffect(() => {
    setActiveMainTab('approvals');
    const timer = setTimeout(() => {
      if (approvalsSectionRef.current) {
        approvalsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        const el = document.getElementById('required-approvals-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [requirements]);

  if (!requirements) return null;

  const { 
    state, 
    district, 
    industry, 
    businessProfile,
    msmeClassification,
    pollutionClassification,
    approvals = [], 
    exemptApprovals = [],
    dependencyGraph,
    documents = [], 
    otherRegistrations = [], 
    nextSteps = [] 
  } = requirements;

  // Filter approvals by selected category
  const filteredApprovals = approvals.filter(app => {
    if (selectedCategoryFilter === 'All Categories') return true;
    return app.category === selectedCategoryFilter;
  });

  const calculatedApprovalsCount = approvals.length;
  const calculatedDocsCount = documents.length;
  const calculatedComplianceCount = 4;
  const actionableCount = dependencyGraph?.actionableCount ?? calculatedApprovalsCount;

  // Check if an application exists for an approval scoped to current state
  const getAppStatusForApproval = (appId, appName) => {
    const userApp = userApplications.find(a => 
      (!a.state || a.state === state) && 
      (a.approvalId === appId || a.approval === appId || (appName && a.approval === appName))
    );
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
          <span>{t('requirementsView.back', '← Back / Change Business Parameters')}</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>{t('requirementsView.requiredClearances', 'Required Clearances:')}</span>
          <span className="font-bold text-slate-900">{t('requirementsView.approvalsNocs', 'Government Approvals, Licenses & NOCs')}</span>
        </div>
      </div>

      {/* SMART REQUIREMENT SUMMARY - Follows Statutory Framework Exact Format */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft relative overflow-hidden">
        
        <div className="space-y-6">
          
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                {t('requirementsView.profileBadge', 'EVALUATED BUSINESS PROFILE & CLASSIFICATION')}
              </div>
              {msmeClassification && (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  MSME: {msmeClassification.label}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-700" />
                <span>{t('requirementsView.state', 'State:')} <strong className="text-slate-900">{t(`states.${state}`, state)}</strong></span>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>{t('requirementsView.district', 'District:')} <strong className="text-slate-900">{district}</strong></span>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-1.5">
                <Factory className="w-3.5 h-3.5 text-amber-700" />
                <span>{t('requirementsView.industry', 'Industry:')} <strong className="text-slate-900">{t(`industries.${industry}`, industry)}</strong></span>
              </div>

              {businessProfile?.entityType && (
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-700" />
                  <span>{t('requirementsView.entity', 'Entity:')} <strong className="text-slate-900">{businessProfile.entityType}</strong></span>
                </div>
              )}

              {pollutionClassification && (
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>{t('requirementsView.pollution', 'Pollution:')} <strong className="text-slate-900">{t(`pollution.${pollutionClassification.category}`, pollutionClassification.category)} {t('requirementsView.category', 'Category')}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Dataset Calculated Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            
            <div 
              onClick={() => {
                setActiveMainTab('approvals');
                setTimeout(() => {
                  approvalsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50);
              }}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
              title="Click to jump directly to the approvals list"
            >
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-brand-800 flex items-center justify-between">
                <span>{t('requirementsView.applicableApprovals', 'Applicable Approvals')}</span>
                <span className="text-brand-700 font-bold text-[10px]">{t('requirementsView.jumpDown', 'Jump ↓')}</span>
              </div>
              <div className="text-3xl font-black text-brand-900 mt-1">
                {calculatedApprovalsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {t('requirementsView.mandatoryClearances', 'Statutory mandatory clearances')}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('requirementsView.docsToPrepare', 'Documents to Prepare')}
              </div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {calculatedDocsCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {t('requirementsView.standardDocs', 'Standard documentation items')}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('requirementsView.actionableNow', 'Actionable Now')}
              </div>
              <div className="text-3xl font-black text-indigo-700 mt-1">
                {actionableCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {t('requirementsView.prerequisitesSatisfied', 'Prerequisites satisfied')}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('requirementsView.conditionalExemptions', 'Conditional Exemptions')}
              </div>
              <div className="text-3xl font-black text-slate-700 mt-1">
                {exemptApprovals.length}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {t('requirementsView.evaluatedNotRequired', 'Evaluated as not required')}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Statutory Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3 shadow-2xs">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          {t('requirementsView.notice', 'Notice: UdyamOne is an MVP prototype. Requirements shown may vary based on location, industry, project size and applicable regulations. Users should verify requirements with the relevant official government authority before submission.')}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-1 overflow-x-auto text-xs font-bold">
        
        {/* Tab 1: Approvals */}
        <button
          onClick={() => {
            setActiveMainTab('approvals');
            setTimeout(() => {
              approvalsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
          }}
          className={`px-4 py-3 rounded-t-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
            activeMainTab === 'approvals'
              ? 'bg-white text-brand-800 border-t-2 border-x border-slate-200 border-t-brand-700 shadow-2xs -mb-1'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-brand-700" />
          <span>{t('requirementsView.tabApprovals', `Required Approvals (${calculatedApprovalsCount})`, { count: calculatedApprovalsCount })}</span>
        </button>

        {/* Tab 2: Dependency Graph */}
        <button
          onClick={() => setActiveMainTab('graph')}
          className={`px-4 py-3 rounded-t-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
            activeMainTab === 'graph'
              ? 'bg-white text-brand-800 border-t-2 border-x border-slate-200 border-t-brand-700 shadow-2xs -mb-1'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-4 h-4 text-indigo-600" />
          <span>{t('requirementsView.tabGraph', `Dependency Graph (${dependencyGraph?.nodes?.length || calculatedApprovalsCount})`, { count: dependencyGraph?.nodes?.length || calculatedApprovalsCount })}</span>
        </button>

        {/* Tab 3: Recommended Sequence / Journey */}
        <button
          onClick={() => setActiveMainTab('journey')}
          className={`px-4 py-3 rounded-t-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
            activeMainTab === 'journey'
              ? 'bg-white text-brand-800 border-t-2 border-x border-slate-200 border-t-brand-700 shadow-2xs -mb-1'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{t('requirementsView.tabJourney', `Approval Journey (${nextSteps.length} Stages)`, { count: nextSteps.length })}</span>
        </button>

        {/* Tab 4: Conditional Exemptions */}
        <button
          onClick={() => setActiveMainTab('exemptions')}
          className={`px-4 py-3 rounded-t-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
            activeMainTab === 'exemptions'
              ? 'bg-white text-brand-800 border-t-2 border-x border-slate-200 border-t-brand-700 shadow-2xs -mb-1'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-slate-500" />
          <span>{t('requirementsView.tabExemptions', `Conditional Exemptions (${exemptApprovals.length})`, { count: exemptApprovals.length })}</span>
        </button>

        {/* Tab 5: Documents */}
        <button
          onClick={() => setActiveMainTab('documents')}
          className={`px-4 py-3 rounded-t-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
            activeMainTab === 'documents'
              ? 'bg-white text-brand-800 border-t-2 border-x border-slate-200 border-t-brand-700 shadow-2xs -mb-1'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>{t('requirementsView.tabDocs', `Required Documents (${calculatedDocsCount})`, { count: calculatedDocsCount })}</span>
        </button>

        {/* Tab 6: Other Registrations */}
        <button
          onClick={() => setActiveMainTab('otherRegs')}
          className={`px-4 py-3 rounded-t-xl transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
            activeMainTab === 'otherRegs'
              ? 'bg-white text-brand-800 border-t-2 border-x border-slate-200 border-t-brand-700 shadow-2xs -mb-1'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>{t('requirementsView.tabOtherRegs', `Statutory Registrations (${otherRegistrations.length})`, { count: otherRegistrations.length })}</span>
        </button>
      </div>

      {/* TAB 1: Required Government Approvals */}
      {activeMainTab === 'approvals' && (
        <div id="required-approvals-section" ref={approvalsSectionRef} className="space-y-6 scroll-mt-20">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('requirementsView.clearancesBadge', 'Statutory Government Clearances')}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t('requirementsView.approvalsTitle', 'Required Government Approvals, Licenses & NOCs')}
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-1">
                  {t('requirementsView.approvalsDesc', `Required government approvals, certificates, licenses, NOCs, and permissions for your facility in ${district}, ${state}.`, { district, state: t(`states.${state}`, state) })}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  {t('requirementsView.showingCount', `Showing ${filteredApprovals.length} of ${calculatedApprovalsCount} Approvals`, { filtered: filteredApprovals.length, total: calculatedApprovalsCount })}
                </span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-1 text-xs text-slate-500 shrink-0">
                <Filter className="w-3.5 h-3.5 text-brand-600 mr-1" />
                <span className="font-semibold text-slate-700">{t('requirementsView.filterDept', 'Filter by Department:')}</span>
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                {REQUIREMENT_CATEGORIES.slice(0, 8).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                      selectedCategoryFilter === cat
                        ? 'bg-brand-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'All Categories' ? t('requirementsView.allCategories', 'All Categories') : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApprovals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  onViewDetails={(app) => setSelectedApprovalModal(app)}
                  userAppStatus={getAppStatusForApproval(approval.id, approval.name)}
                />
              ))}
            </div>

            {filteredApprovals.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-6">
                {t('requirementsView.noApprovalsUnder', `No approvals categorized under "${selectedCategoryFilter}". Select "All Categories" to view all.`, { category: selectedCategoryFilter })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Dependency Graph */}
      {activeMainTab === 'graph' && (
        <DependencyGraph
          dependencyGraph={dependencyGraph}
          onStartApplicationForApproval={onStartApplicationForApproval}
          onViewDetails={(app) => setSelectedApprovalModal(app)}
        />
      )}

      {/* TAB 3: Recommended Sequence / Journey */}
      {activeMainTab === 'journey' && (
        <RecommendedJourney
          steps={nextSteps}
          approvals={approvals}
          dependencyGraph={dependencyGraph}
          onViewApprovalDetails={(app) => setSelectedApprovalModal(app)}
          onStartApplication={onStartApplicationForApproval}
        />
      )}

      {/* TAB 4: Conditional Exemptions */}
      {activeMainTab === 'exemptions' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {t('requirementsView.exemptionsTitle', 'Conditional Exemptions & Non-Applicable Approvals')}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              {t('requirementsView.exemptionsDesc', 'The statutory rules engine evaluated your business parameters against Central & State acts and confirmed the following clearances are not required for your profile.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exemptApprovals.map((item) => (
              <div 
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {t('requirementsView.exemptedNotApplicable', 'EXEMPTED / NOT APPLICABLE')}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">
                    {item.name}
                  </h4>
                  <div className="text-xs font-semibold text-brand-700 mt-0.5">
                    {item.department || item.authority}
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">{t('requirementsView.statutoryReason', 'Statutory Reason:')} </strong>
                    <span>{item.exemptionReason || item.applicability}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span>{t('requirementsView.governingStatute', 'Governing Statute:')} {item.officialSource}</span>
                  <span>{t('requirementsView.ruleTrigger', 'Rule Trigger:')} {item.ruleTrigger || t('requirementsView.thresholdRule', 'Threshold rule')}</span>
                </div>
              </div>
            ))}
          </div>

          {exemptApprovals.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              {t('requirementsView.noExemptions', 'All master industrial clearances apply to this facility. No conditional exemptions detected.')}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Documents */}
      {activeMainTab === 'documents' && (
        <DocumentChecklist 
          documents={documents} 
          onDocumentsUpdated={onDocumentsUpdated}
          applicationId={null}
          userId={null}
        />
      )}

      {/* TAB 6: Other Registrations */}
      {activeMainTab === 'otherRegs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900">
              {t('requirementsView.otherRegsTitle', 'Statutory Business & Tax Registrations')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('requirementsView.otherRegsDesc', 'General enterprise registrations required alongside specific industrial licenses.')}
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
                      <span>{t('requirementsView.officialPortal', 'Official Portal')}</span>
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
