import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Layers, 
  GitBranch, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Send, 
  Calendar, 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink,
  Edit3,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { applicationApi } from '../services/api';
import { DocumentChecklist } from '../components/DocumentChecklist';
import { ApprovalCard } from '../components/ApprovalCard';
import { ApprovalDetailModal } from '../components/ApprovalDetailModal';
import { DependencyGraph } from '../components/DependencyGraph';
import { NextStepsTimeline } from '../components/NextStepsTimeline';

export const ApplicationWorkspacePage = ({ 
  applicationId, 
  initialTab = 'approvals', // 'profile', 'approvals', 'sequence', 'graph', 'documents', 'progress', 'timeline'
  onNavigate,
  onToast 
}) => {
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab || 'approvals');
  const [selectedApprovalModal, setSelectedApprovalModal] = useState(null);
  const approvalsRef = useRef(null);

  // Load application from backend
  const loadApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationApi.getById(applicationId);
      if (res && res.success && res.application) {
        setAppData(res.application);
      } else {
        setError('Application not found or access denied');
      }
    } catch (err) {
      console.error('Error fetching application:', err);
      setError(err.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    }
  }, [applicationId]);

  // Handle direct navigation to /approvals
  useEffect(() => {
    if (initialTab === 'approvals') {
      setActiveTab('approvals');
      setTimeout(() => {
        if (approvalsRef.current) {
          approvalsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Save progress handler
  const handleSaveProgress = async () => {
    if (!appData) return;
    try {
      setSaving(true);
      const targetId = appData.applicationId || appData._id;
      const res = await applicationApi.update(targetId, {
        businessProfile: appData.businessProfile,
        progressPercentage: appData.progressPercentage,
        status: appData.status
      });
      if (res && res.success) {
        setAppData(res.application);
        if (onToast) onToast('Application progress saved successfully!');
      }
    } catch (err) {
      if (onToast) onToast(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Submit application handler
  const handleSubmitApplication = async () => {
    if (!appData) return;
    if (!window.confirm('Are you sure you want to submit this application for official department scrutiny?')) {
      return;
    }
    try {
      setSubmitting(true);
      const targetId = appData.applicationId || appData._id;
      const res = await applicationApi.submit(targetId);
      if (res && res.success) {
        setAppData(res.application);
        if (onToast) onToast('Application submitted successfully! Department review initiated.');
      }
    } catch (err) {
      if (onToast) onToast(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Documents updated callback
  const handleDocumentsUpdated = async (updatedDocs) => {
    if (!appData) return;
    setAppData(prev => ({
      ...prev,
      documents: updatedDocs
    }));
    // Also sync to backend
    try {
      const targetId = appData.applicationId || appData._id;
      await applicationApi.update(targetId, { documents: updatedDocs });
    } catch (err) {
      console.warn('Silent doc sync error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-10 h-10 text-brand-600 animate-spin mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Loading Application Dossier...</h2>
        <p className="text-xs text-slate-500 mt-1">Verifying ownership and fetching statutory records from database</p>
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Application Access Restricted</h2>
        <p className="text-xs text-slate-600">
          {error || 'This application does not exist or does not belong to your account.'}
        </p>
        <button
          onClick={() => onNavigate('/my-applications')}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to My Applications</span>
        </button>
      </div>
    );
  }

  const {
    applicationId: displayId = applicationId,
    applicantName = 'Industrial Applicant',
    state,
    district,
    industry,
    businessProfile = {},
    status = 'In Progress',
    progressPercentage = 35,
    approvals = [],
    approvalSequence = [],
    dependencyGraph = {},
    documents = [],
    timeline = [],
    msmeClassification,
    pollutionClassification,
    certificateNumber
  } = appData;

  const approvedDocsCount = documents.filter(d => d.status === 'APPROVED').length;
  const isCompleted = status === 'Completed';
  const isSubmitted = status === 'Submitted';

  const workspaceTabs = [
    { id: 'approvals', label: 'Required Approvals', count: approvals.length },
    { id: 'sequence', label: 'Approval Sequence' },
    { id: 'graph', label: 'Dependency Graph' },
    { id: 'documents', label: 'Required Documents', count: `${approvedDocsCount}/${documents.length}` },
    { id: 'profile', label: 'Business Profile' },
    { id: 'progress', label: 'Application Progress' },
    { id: 'timeline', label: 'Audit Timeline', count: timeline.length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      
      {/* 1. Top Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        
        {/* Navigation & Status Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <button
              onClick={() => onNavigate('/my-applications')}
              className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-brand-700 transition-colors cursor-pointer group mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Back to My Applications</span>
            </button>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-black px-3 py-1 rounded-xl bg-brand-50 text-brand-800 border border-brand-200">
                {displayId}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg uppercase tracking-wider ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : isSubmitted
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {status}
              </span>
              {certificateNumber && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono">
                  Cert: {certificateNumber}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {applicantName} • {industry}
            </h1>
            <div className="flex items-center text-xs text-slate-500 space-x-3">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {district}, {state}
              </span>
              <span>•</span>
              <span>{msmeClassification ? `${msmeClassification.enterpriseType} Enterprise` : 'MSME'}</span>
              <span>•</span>
              <span>{pollutionClassification ? `${pollutionClassification.category} Category` : 'Industrial Unit'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleSaveProgress}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>{saving ? 'Saving...' : 'Save & Continue Later'}</span>
            </button>

            {!isCompleted && !isSubmitted && (
              <button
                onClick={handleSubmitApplication}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 active:scale-95 text-white text-xs font-black shadow-md shadow-brand-700/20 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-600">Application Completion Progress</span>
            <span className="text-brand-700 font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-brand-600 to-emerald-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-1 border-t border-slate-100 pt-3 overflow-x-auto">
          {workspaceTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

      </div>

      {/* 2. TAB CONTENT PANELS */}

      {/* TAB 1: REQUIRED APPROVALS */}
      {activeTab === 'approvals' && (
        <div ref={approvalsRef} id="required-approvals-section" className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-brand-700" />
                  <span>Required Government Approvals, Licenses & NOCs</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Mandatory and conditional clearances determined for your specific business profile
                </p>
              </div>
              <div className="text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 font-medium">
                Total statutory clearances: <strong className="text-brand-800">{approvals.length}</strong>
              </div>
            </div>

            {approvals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {approvals.map((approval) => (
                  <ApprovalCard
                    key={approval.id}
                    approval={approval}
                    onOpenDetail={() => setSelectedApprovalModal(approval)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No statutory clearances required for the selected operational parameters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPROVAL SEQUENCE */}
      {activeTab === 'sequence' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-brand-700" />
              <span>Approval Sequence & Phased Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Statutory timeline organized by chronological operational milestones
            </p>
          </div>
          <NextStepsTimeline nextSteps={approvalSequence} />
        </div>
      )}

      {/* TAB 3: DEPENDENCY GRAPH */}
      {activeTab === 'graph' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-brand-700" />
              <span>Clearance Dependency Graph (DAG)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Visualizes prerequisite dependencies and approvals that can be executed in parallel
            </p>
          </div>
          <DependencyGraph 
            graphData={dependencyGraph} 
            approvals={approvals}
            onSelectApproval={(approval) => setSelectedApprovalModal(approval)}
          />
        </div>
      )}

      {/* TAB 4: REQUIRED DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <DocumentChecklist
            documents={documents}
            onDocumentsUpdated={handleDocumentsUpdated}
            applicationId={displayId}
            userId={appData.userId}
          />
        </div>
      )}

      {/* TAB 5: BUSINESS PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-brand-700" />
              <span>Business Profile & Operational Parameters</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configured parameters used by the statutory rule engine to calculate approvals and exemptions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">State & District</div>
              <div className="text-sm font-black text-slate-800 mt-1">{district}, {state}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Industry Sector</div>
              <div className="text-sm font-black text-slate-800 mt-1">{industry}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Constitution / Entity</div>
              <div className="text-sm font-black text-slate-800 mt-1">{businessProfile.entityType || 'Private Limited'}</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Plant & Machinery Investment</div>
              <div className="text-sm font-black text-slate-800 mt-1">₹{businessProfile.investment || 2.5} Crore</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Annual Turnover</div>
              <div className="text-sm font-black text-slate-800 mt-1">₹{businessProfile.turnover || 12.0} Crore</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Expected Workforce</div>
              <div className="text-sm font-black text-slate-800 mt-1">{businessProfile.employeeCount || 25} Employees</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Contract Power Load</div>
              <div className="text-sm font-black text-slate-800 mt-1">{businessProfile.powerRequired || 75} kW</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Built-up Industrial Area</div>
              <div className="text-sm font-black text-slate-800 mt-1">{businessProfile.builtUpArea || 1500} sq.m</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Hazardous Chemicals</div>
              <div className="text-sm font-black text-slate-800 mt-1">
                {businessProfile.usesHazardousChemicals ? (
                  <span className="text-red-600 font-bold">Yes (PESO Applicable)</span>
                ) : (
                  <span className="text-emerald-700 font-bold">No</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: APPLICATION PROGRESS */}
      {activeTab === 'progress' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Application Progress & Milestones</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Checklist of completed vs pending steps for this industrial project
            </p>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Operational Profile Configured', desc: 'Business location, investment, and parameters registered', completed: true },
              { title: 'Statutory Clearance Discovery', desc: `${approvals.length} mandatory and conditional licenses identified`, completed: true },
              { title: 'Dependency Graph Generated', desc: 'Prerequisite sequence and topological ordering mapped', completed: true },
              { title: 'Document Submissions & Database Verification', desc: `${approvedDocsCount} of ${documents.length} documents verified against official records`, completed: approvedDocsCount >= documents.length },
              { title: 'Application Dossier Submission', desc: 'Lodged for single-window scrutinization', completed: isSubmitted || isCompleted },
              { title: 'Department Scrutiny & Field Inspection', desc: 'Officer review and technical assessment', completed: isCompleted },
              { title: 'Final Approvals & Grant of Licenses', desc: 'Digital certificates released', completed: isCompleted }
            ].map((step, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  step.completed ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                    step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {step.completed ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{step.title}</div>
                    <div className="text-xs text-slate-500">{step.desc}</div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  step.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {step.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: TIMELINE AUDIT */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-brand-700" />
              <span>Application Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Cryptographic and timestamped log of all events and submissions
            </p>
          </div>

          <div className="flow-root pt-2">
            <ul className="-mb-8">
              {timeline.map((event, idx) => (
                <li key={idx}>
                  <div className="relative pb-8">
                    {idx !== timeline.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-100 text-brand-800 flex items-center justify-center ring-4 ring-white text-xs font-black">
                          ✓
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{event.event}</p>
                          {event.remarks && <p className="text-xs text-slate-500 mt-0.5">{event.remarks}</p>}
                        </div>
                        <div className="whitespace-nowrap text-right text-[11px] text-slate-400">
                          {new Date(event.date || Date.now()).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Modal for Approval Details */}
      <ApprovalDetailModal
        approval={selectedApprovalModal}
        isOpen={!!selectedApprovalModal}
        onClose={() => setSelectedApprovalModal(null)}
      />

    </div>
  );
};
