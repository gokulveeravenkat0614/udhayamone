import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  AlertCircle, 
  Eye, 
  X
} from 'lucide-react';

export const OfficerPortal = ({ applications, onUpdateApplication }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);

  // Review action modal states
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState('');

  // Stats calculation
  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'Pending').length;
  const underReviewApps = applications.filter(a => a.status === 'Under Review').length;
  const approvedApps = applications.filter(a => a.status === 'Approved').length;
  const rejectedApps = applications.filter(a => a.status === 'Rejected').length;

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.approval.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.industry.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'pending') return matchesSearch && app.status === 'Pending';
    if (statusFilter === 'under_review') return matchesSearch && app.status === 'Under Review';
    if (statusFilter === 'approved') return matchesSearch && app.status === 'Approved';
    if (statusFilter === 'rejected') return matchesSearch && app.status === 'Rejected';
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Under Review':
        return 'bg-blue-100 text-brand-800 border-blue-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Action Required':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const handleOpenReview = (app) => {
    setSelectedAppForReview(app);
    setOfficerRemarks(app.officerNotes || '');
    setActionType(null);
    setActionSuccessMessage('');
  };

  const handleApplyOfficerAction = (action) => {
    if (!selectedAppForReview) return;

    let updatedApp = { ...selectedAppForReview };

    if (action === 'approve') {
      updatedApp.status = 'Approved';
      updatedApp.currentStageIndex = 4;
      updatedApp.requiredAction = 'Statutory approval issued. Digital certificate ready for download.';
      updatedApp.officerNotes = officerRemarks || 'Statutory parameters vetted and found fully compliant with state regulations.';
      updatedApp.certificateNumber = updatedApp.certificateNumber || `MH-GOV-APPROVE-${Date.now().toString().slice(-6)}`;
      // Mark all stages done
      if (updatedApp.stages) {
        updatedApp.stages = updatedApp.stages.map(s => ({ ...s, done: true }));
      }
      setActionSuccessMessage(`Application ${updatedApp.id} has been Approved! Certificate generated.`);
    } else if (action === 'request_docs') {
      updatedApp.status = 'Under Review';
      updatedApp.requiredAction = `Officer Query: ${officerRemarks || 'Additional clarification requested on machinery load and fire layout'}`;
      updatedApp.officerNotes = officerRemarks || 'Please re-upload certified layout drawings with legible dimensions.';
      setActionSuccessMessage(`Clarification notice dispatched for ${updatedApp.id}.`);
    } else if (action === 'reject') {
      updatedApp.status = 'Rejected';
      updatedApp.requiredAction = `Application Rejected: ${officerRemarks || 'Does not meet zonal master plan requirements.'}`;
      updatedApp.officerNotes = officerRemarks || 'Grounds: Violation of non-conforming industrial zone norms.';
      setActionSuccessMessage(`Application ${updatedApp.id} marked Rejected.`);
    }

    onUpdateApplication(updatedApp);
    setSelectedAppForReview(updatedApp);
    setTimeout(() => {
      setSelectedAppForReview(null);
      setActionSuccessMessage('');
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Officer Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Government Officer Review Desk</span>
              <span className="text-amber-400/50">•</span>
              <span>Single-Window Clearance Cell</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Single-Window Scrutiny & Approval Desk
            </h1>

            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Examine statutory applications, audit uploaded enterprise documents, conduct technical scrutiny, and grant digital clearances.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-right self-start md:self-auto shrink-0">
            <div className="text-xs text-blue-200">Logged Officer</div>
            <div className="text-sm font-bold text-white">Er. Shailesh Patil, Deputy Director</div>
            <div className="text-[11px] text-amber-300">State Industrial Clearances Directorate</div>
          </div>
        </div>

        {/* 5 Officer Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8 pt-6 border-t border-white/10">
          
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Applications</div>
            <div className="text-2xl font-black text-white mt-1">{totalApps}</div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-amber-300 font-semibold uppercase">Pending</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{pendingApps}</div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-blue-300 font-semibold uppercase">Under Review</div>
            <div className="text-2xl font-black text-blue-300 mt-1">{underReviewApps}</div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[11px] text-emerald-300 font-semibold uppercase">Approved</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{approvedApps}</div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-rose-300 font-semibold uppercase">Rejected</div>
            <div className="text-2xl font-black text-rose-300 mt-1">{rejectedApps}</div>
          </div>

        </div>

      </div>

      {/* Applications Review Table Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        
        {/* Table Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Applications Requiring Officer Review
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click "Review" on any row to inspect documents and issue departmental approvals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Applicant, ID, Sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 text-xs overflow-x-auto self-start sm:self-auto">
              {['all', 'pending', 'under_review', 'approved', 'rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-brand-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Application Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px] bg-slate-50/70">
                <th className="py-3.5 px-4 rounded-l-xl">Application ID</th>
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">Industry</th>
                <th className="py-3.5 px-4">Approval</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-brand-800">
                    {app.id}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    <div>{app.applicant}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{app.location}</div>
                  </td>
                  <td className="py-4 px-4 text-slate-700">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                      {app.industry}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-800">
                    {app.approval}
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {app.submissionDate}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleOpenReview(app)}
                      className="px-4 py-1.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all inline-flex items-center space-x-1 cursor-pointer active:scale-95"
                    >
                      <span>Review</span>
                      <Eye className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApps.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              No matching applications found.
            </div>
          )}
        </div>

      </div>

      {/* OFFICER REVIEW MODAL / DRAWER */}
      {selectedAppForReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-6 sm:p-7 relative shrink-0">
              <button
                onClick={() => setSelectedAppForReview(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-300 mb-1">
                <span>Officer Scrutiny Console</span>
                <span>•</span>
                <span>ID: {selectedAppForReview.id}</span>
              </div>

              <h2 className="text-2xl font-black text-white">
                Review: {selectedAppForReview.approval}
              </h2>

              <div className="text-xs text-blue-200 mt-1">
                Applicant: <strong>{selectedAppForReview.applicant}</strong> ({selectedAppForReview.industry})
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-xs text-slate-700">
              
              {actionSuccessMessage && (
                <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold flex items-center space-x-2 shadow-md animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                  <span>{actionSuccessMessage}</span>
                </div>
              )}

              {/* Applicant Profile Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block font-medium">Enterprise Name:</span>
                  <strong className="text-slate-900 text-sm">{selectedAppForReview.applicant}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Promoter / Authorized Signatory:</span>
                  <strong className="text-slate-800">{selectedAppForReview.promoter || 'Vikramaditya Sharma'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Factory Site Location:</span>
                  <span className="text-slate-700">{selectedAppForReview.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Contact:</span>
                  <span className="text-slate-700">{selectedAppForReview.contactEmail} • {selectedAppForReview.contactPhone}</span>
                </div>
              </div>

              {/* Submitted Supporting Documents for Verification */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Attached Verification Documents</span>
                  <span className="text-slate-400 font-normal">Click to preview</span>
                </h4>

                <div className="space-y-2">
                  {selectedAppForReview.submittedDocs?.map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 hover:border-brand-300 flex items-center justify-between transition-colors">
                      <div className="flex items-center space-x-2.5 truncate">
                        <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                        <span className="text-slate-400 text-[11px]">({doc.file})</span>
                      </div>
                      <button
                        onClick={() => alert(`Simulated Officer Preview: Opening "${doc.file}" with statutory digital signature verification.`)}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </div>
                  )) || (
                    <div className="text-slate-400">No documents attached.</div>
                  )}
                </div>
              </div>

              {/* Officer Remarks Input Box */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-900 uppercase tracking-wider">
                  Officer Remarks & Statutory Audit Observations
                </label>
                <textarea
                  rows={3}
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                  placeholder="Enter scrutiny notes, compliance satisfaction, or missing document clarifications..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-hidden font-medium"
                />
              </div>

            </div>

            {/* Officer Action Bar */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedAppForReview(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
              >
                Close Desk
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleApplyOfficerAction('reject')}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center space-x-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => handleApplyOfficerAction('request_docs')}
                  className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors flex items-center space-x-1.5"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Request Clarification</span>
                </button>

                <button
                  onClick={() => handleApplyOfficerAction('approve')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Grant Clearance</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
