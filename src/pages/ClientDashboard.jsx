import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Clock, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { applicationApi } from '../services/api';

export const ClientDashboard = ({ 
  currentUser, 
  onNavigate, 
  onStartNewApplication 
}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationApi.getMyApplications();
      if (res && res.success) {
        setApplications(res.applications || []);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Unable to fetch your applications. Showing local offline data if available.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const activeApplications = applications.filter(a => a.status === 'In Progress');
  const completedOrSubmitted = applications.filter(a => a.status === 'Completed' || a.status === 'Submitted');

  // Extract recent timeline activities across all owned applications
  const allTimelineEvents = applications.flatMap(app => 
    (app.timeline || []).map(t => ({
      ...t,
      appId: app.applicationId || app._id,
      industry: app.industry,
      dateObj: new Date(t.date || app.updatedAt || app.createdAt)
    }))
  ).sort((a, b) => b.dateObj - a.dateObj).slice(0, 5);

  const clientId = currentUser?.id 
    ? `CLT-${String(currentUser.id).slice(-6).toUpperCase()}` 
    : 'CLT-DEMO01';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-brand-200 border border-white/15 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Account Workspace</span>
              <span className="text-white/40">•</span>
              <span className="font-mono text-amber-300 font-bold">{clientId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-amber-200">{currentUser?.name || 'Enterprise Client'}</span>!
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Track your industrial clearances, sequence dependencies, and statutory approvals in one place.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onStartNewApplication ? onStartNewApplication() : onNavigate('/application/new')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white text-xs sm:text-sm font-black shadow-lg shadow-brand-900/40 hover:shadow-brand-500/20 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Start New Application</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Applications</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{applications.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-amber-700 uppercase">In Progress</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{activeApplications.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 uppercase">Completed</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {applications.filter(a => a.status === 'Completed').length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-blue-700 uppercase">Submitted</div>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {applications.filter(a => a.status === 'Submitted').length}
          </div>
        </div>
      </div>

      {/* 2. Active Applications Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Active In-Progress Applications</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              {activeApplications.length}
            </span>
          </div>
          <button
            onClick={() => onNavigate('/my-applications')}
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <RefreshCw className="w-6 h-6 text-brand-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading your applications securely from database...</p>
          </div>
        ) : activeApplications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {activeApplications.map((app) => {
              const appId = app.applicationId || app._id;
              const progress = app.progressPercentage || 30;
              const approvalsCount = (app.approvals || []).length;
              const docsCount = (app.documents || []).length;
              const approvedDocsCount = (app.documents || []).filter(d => d.status === 'APPROVED').length;

              return (
                <div 
                  key={appId}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-lg">
                            {appId}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                            {app.status}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-2">
                          {app.industry} Unit
                        </h3>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>{app.district}, {app.state}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Overall Progress</span>
                        <span className="text-brand-700 font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>{approvalsCount} Clearances Tracked</span>
                        <span>{approvedDocsCount}/{docsCount} Documents Approved</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Updated {new Date(app.updatedAt || app.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => onNavigate(`/application/${encodeURIComponent(appId)}/approvals`)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-xs hover:shadow transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>Continue Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center mx-auto">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No active applications in progress</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You do not have any unfinished applications right now. Create a new one to discover required approvals and sequence.
              </p>
            </div>
            <button
              onClick={() => onStartNewApplication ? onStartNewApplication() : onNavigate('/application/new')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Start Your First Application</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Completed / Past Applications Summary */}
      {completedOrSubmitted.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Submitted & Completed Dossiers</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {completedOrSubmitted.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedOrSubmitted.map((app) => {
              const appId = app.applicationId || app._id;
              return (
                <div 
                  key={appId}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{appId}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-800">{app.industry} ({app.district}, {app.state})</div>
                    {app.certificateNumber && (
                      <div className="text-[11px] font-mono text-emerald-700">
                        License No: {app.certificateNumber}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onNavigate(`/application/${encodeURIComponent(appId)}`)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    View Dossier &rarr;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Recent Account Activity */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-brand-600" />
          <h2 className="text-base font-bold text-slate-900">Recent Account Activity</h2>
        </div>

        {allTimelineEvents.length > 0 ? (
          <div className="flow-root">
            <ul className="-mb-8">
              {allTimelineEvents.map((event, idx) => (
                <li key={idx}>
                  <div className="relative pb-8">
                    {idx !== allTimelineEvents.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-4 ring-white text-brand-700 text-xs font-bold">
                          ✓
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {event.event} <span className="text-slate-400 font-normal">for</span> <span className="font-mono text-brand-700 font-semibold">{event.appId}</span>
                          </p>
                          {event.remarks && (
                            <p className="text-[11px] text-slate-500 mt-0.5">{event.remarks}</p>
                          )}
                        </div>
                        <div className="whitespace-nowrap text-right text-[11px] text-slate-400">
                          {event.dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No activity recorded yet.</p>
        )}
      </div>

    </div>
  );
};
