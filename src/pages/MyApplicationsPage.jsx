import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Filter, 
  Layers, 
  ShieldCheck, 
  AlertCircle,
  FolderOpen,
  RefreshCw
} from 'lucide-react';
import { applicationApi } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

export const MyApplicationsPage = ({ 
  currentUser, 
  onNavigate, 
  onStartNewApplication 
}) => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'in_progress', 'submitted', 'completed'
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
      setError('Unable to load applications from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const totalCount = applications.length;
  const inProgressCount = applications.filter(a => a.status === 'In Progress').length;
  const submittedCount = applications.filter(a => a.status === 'Submitted').length;
  const completedCount = applications.filter(a => a.status === 'Completed').length;

  const filteredApplications = applications.filter(app => {
    if (activeFilter === 'in_progress') return app.status === 'In Progress';
    if (activeFilter === 'submitted') return app.status === 'Submitted';
    if (activeFilter === 'completed') return app.status === 'Completed';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {t('myApps.title', 'My Applications')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('myApps.subtitle', 'Manage your industrial establishment approvals, document submissions, and statutory milestones')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onStartNewApplication ? onStartNewApplication() : onNavigate('/application/new')}
            className="px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-700/20 active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('myApps.newApp', '+ New Application')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: t('myApps.all', 'All Applications'), count: totalCount },
          { id: 'in_progress', label: t('myApps.inProgress', 'In Progress'), count: inProgressCount, badgeClass: 'bg-amber-100 text-amber-800' },
          { id: 'submitted', label: t('myApps.submitted', 'Submitted'), count: submittedCount, badgeClass: 'bg-blue-100 text-blue-800' },
          { id: 'completed', label: t('myApps.completed', 'Completed'), count: completedCount, badgeClass: 'bg-emerald-100 text-emerald-800' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeFilter === tab.id 
                ? 'bg-white/20 text-white' 
                : (tab.badgeClass || 'bg-slate-200 text-slate-700')
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium text-slate-500">{t('myApps.loading', 'Loading your applications securely from database...')}</p>
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((app) => {
            const appId = app.applicationId || app._id;
            const progress = app.progressPercentage || 30;
            const approvalsCount = (app.approvals || []).length;
            const docsCount = (app.documents || []).length;
            const approvedDocsCount = (app.documents || []).filter(d => d.status === 'APPROVED').length;
            const isInProgress = app.status === 'In Progress';

            // Determine localized stage description
            let currentStageKey = 'stageApprovals';
            let defaultStage = 'Approvals Identified';
            if (app.status === 'Completed') {
              currentStageKey = 'stageApproved';
              defaultStage = 'Approved & Granted';
            } else if (app.status === 'Submitted') {
              currentStageKey = 'stageScrutiny';
              defaultStage = 'Under Scrutiny';
            } else if (approvedDocsCount < docsCount) {
              currentStageKey = 'stageDocsRequired';
              defaultStage = 'Documents Required';
            }

            const statusLabel = app.status === 'Completed'
              ? t('common.completed', 'Completed')
              : app.status === 'Submitted'
              ? t('common.submitted', 'Submitted')
              : t('common.inProgress', 'In Progress');

            return (
              <div
                key={appId}
                className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar inside card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-black text-brand-800 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-lg">
                        {appId}
                      </span>
                      <h2 className="text-base font-black text-slate-900 mt-2 line-clamp-1">
                        {app.applicantName || 'Industrial Project'}
                      </h2>
                      <p className="text-xs font-semibold text-brand-700">
                        {t('industries.' + app.industry, app.industry)}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                      app.status === 'Completed' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : app.status === 'Submitted'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>

                  {/* Location & Stage */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                      <span>{app.district}, {t('states.' + app.state, app.state)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-500 pt-1">
                      <span className="font-semibold text-slate-700">{t('myApps.currentStage', 'Current Stage:')}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[11px]">
                        {t('myApps.' + currentStageKey, defaultStage)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">{t('myApps.progress', 'Progress')}</span>
                      <span className="text-brand-700 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          app.status === 'Completed'
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-brand-600 to-emerald-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Approvals & Documents Count Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 font-medium">{t('myApps.clearances', 'Clearances')}</div>
                      <div className="text-slate-800 font-black mt-0.5">
                        {t('myApps.clearancesCount', '{count} required', { count: approvalsCount })}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-slate-400 font-medium">{t('common.documents', 'Documents')}</div>
                      <div className="text-slate-800 font-black mt-0.5">
                        {t('myApps.docsCount', '{approved}/{total} approved', { approved: approvedDocsCount, total: docsCount })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer and Buttons */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>{t('myApps.lastModified', 'Last modified:')}</span>
                    <span>{new Date(app.updatedAt || app.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => onNavigate(`/application/${encodeURIComponent(appId)}`)}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all text-center cursor-pointer"
                    >
                      {t('myApps.viewApplication', 'View Application')}
                    </button>
                    {isInProgress && (
                      <button
                        onClick={() => onNavigate(`/application/${encodeURIComponent(appId)}/approvals`)}
                        className="flex-1 py-2 px-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all text-center flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <span>{t('myApps.continue', 'Continue')}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {t('myApps.noMatchTitle', 'No applications match this filter')}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {activeFilter === 'all'
                ? t('myApps.noMatchAll', 'You have not created any applications yet. Create one now to discover statutory clearance sequences.')
                : t('myApps.noMatchFiltered', 'There are currently no applications marked as "{filter}".', { filter: activeFilter.replace('_', ' ') })}
            </p>
          </div>
          <button
            onClick={() => onStartNewApplication ? onStartNewApplication() : onNavigate('/application/new')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('myApps.createApplication', 'Create New Application')}</span>
          </button>
        </div>
      )}

    </div>
  );
};
