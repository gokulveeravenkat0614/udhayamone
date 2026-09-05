import React, { useState } from 'react';
import { 
  AlertCircle, 
  Plus, 
  Search, 
  ChevronRight 
} from 'lucide-react';
import { ApplicationTrackerModal } from './ApplicationTrackerModal';

export const EntrepreneurDashboard = ({ 
  applications, 
  onStartNewApplication,
  onViewCompliance,
  _onViewSchemes 
}) => {
  const [selectedAppForTracker, setSelectedAppForTracker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'Pending' || a.status === 'Under Review').length;
  const approvedApps = applications.filter(a => a.status === 'Approved').length;
  const complianceDue = 2; // As specified in the prompt

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.approval.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'approved') return matchesSearch && app.status === 'Approved';
    if (statusFilter === 'under_review') return matchesSearch && app.status === 'Under Review';
    if (statusFilter === 'pending') return matchesSearch && app.status === 'Pending';
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
      case 'Rejected':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      
      {/* Dashboard Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft relative overflow-hidden">
        
        {/* Decorative subtle background pattern */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-800 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Single-Window Enterprise Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Welcome to UdyamOne
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="font-bold text-slate-900 text-base">
                Business: ABC Manufacturing Pvt. Ltd.
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                Plot No. 42, MIDC Bhosari, Pune, Maharashtra
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Udyam: UDYAM-MH-26-0091823
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto shrink-0">
            <button
              onClick={onStartNewApplication}
              className="px-5 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-md shadow-brand-700/25 transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for New Clearance</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-white border border-blue-100 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Applications
            </div>
            <div className="text-3xl font-black text-brand-900 mt-1">
              {totalApps}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Active statutory dossiers
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-100 shadow-2xs">
            <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Pending
            </div>
            <div className="text-3xl font-black text-amber-800 mt-1">
              {pendingApps}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">
              Under scrutiny or inspection
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100 shadow-2xs">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Approved
            </div>
            <div className="text-3xl font-black text-emerald-800 mt-1">
              {approvedApps}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              Digital certificates available
            </div>
          </div>

          <div 
            onClick={onViewCompliance}
            className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/80 to-white border border-rose-100 shadow-2xs cursor-pointer hover:border-rose-300 transition-colors"
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-700 uppercase tracking-wider">
              <span>Compliance Due</span>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-3xl font-black text-rose-800 mt-1">
              {complianceDue}
            </div>
            <div className="text-[11px] text-rose-600 mt-0.5 flex items-center justify-between">
              <span>Factory & Form V filings</span>
              <span className="underline">View →</span>
            </div>
          </div>

        </div>

      </div>

      {/* AI Identity Verification */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-brand-800 text-[10px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500"/> AI Identity Layer
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Identity Verification</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">Verify your identity using document capture, OCR and live selfie face comparison before submitting sensitive approvals.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-2 rounded-xl text-xs font-black uppercase ${verificationStatus==='verified'?'bg-emerald-100 text-emerald-700':verificationStatus==='pending'?'bg-amber-100 text-amber-700':verificationStatus==='failed'?'bg-rose-100 text-rose-700':'bg-slate-100 text-slate-600'}`}>{verificationStatus.replace('_',' ')}</span>
            <button onClick={onVerifyIdentity} className="px-5 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold">{verificationStatus==='verified'?'View / Reverify':'Verify Identity'}</button>
          </div>
        </div>
      </div>

      {/* "My Applications" Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              My Applications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any application to open the live 5-stage interactive tracking timeline.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search by ID or Approval..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20 outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="flex items-center space-x-1.5 text-xs self-start sm:self-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('under_review')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === 'under_review' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800'
                }`}
              >
                Under Review
              </button>
              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  statusFilter === 'approved' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                Approved
              </button>
            </div>
          </div>
        </div>

        {/* Applications Table / Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px] bg-slate-50/70">
                <th className="py-3 px-4 rounded-l-xl">Application ID</th>
                <th className="py-3 px-4">Approval Name</th>
                <th className="py-3 px-4">Department / Authority</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.map((app) => (
                <tr 
                  key={app.id} 
                  onClick={() => setSelectedAppForTracker(app)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-4 font-mono font-bold text-brand-800 group-hover:underline">
                    {app.id}
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    {app.approval}
                  </td>
                  <td className="py-4 px-4 text-slate-600 max-w-xs truncate">
                    {app.department}
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium">
                    {app.submissionDate}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppForTracker(app);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-800 font-semibold text-xs border border-slate-200 transition-colors inline-flex items-center space-x-1"
                    >
                      <span>Track</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApplications.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              No matching applications found.
            </div>
          )}
        </div>

      </div>

      {/* Interactive Application Tracker Modal */}
      <ApplicationTrackerModal
        application={selectedAppForTracker}
        isOpen={!!selectedAppForTracker}
        onClose={() => setSelectedAppForTracker(null)}
      />

    </div>
  );
};
