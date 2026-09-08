import React from 'react';
import { 
  Landmark, 
  ExternalLink, 
  ChevronRight 
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export const ApprovalCard = ({ 
  approval, 
  onViewDetails, 
  _onStartApplication,
  userAppStatus // e.g. "NOT STARTED", "READY TO APPLY", "APPLICATION SUBMITTED", "UNDER REVIEW", "APPROVED"
}) => {
  const { t } = useTranslation();
  const isUserSubmitted = userAppStatus && userAppStatus !== "NOT STARTED";
  
  // Status display: if user actually started/submitted application, show that; otherwise show "CHECK APPLICABILITY"
  const displayStatus = isUserSubmitted ? userAppStatus : (approval.status || "CHECK APPLICABILITY");

  const statusTranslationMap = {
    'APPROVED': 'approvals.approved',
    'Approved': 'approvals.approved',
    'APPLICATION SUBMITTED': 'approvals.applicationSubmitted',
    'UNDER REVIEW': 'approvals.underReview',
    'READY TO APPLY': 'approvals.readyToApply',
    'DOCUMENTS READY': 'common.documentsReady',
    'CHECK APPLICABILITY': 'approvals.checkApplicability',
    'NOT STARTED': 'common.notStarted'
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'APPLICATION SUBMITTED':
      case 'UNDER REVIEW':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'READY TO APPLY':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300';
      case 'DOCUMENTS READY':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'CHECK APPLICABILITY':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft hover:shadow-card-hover transition-all duration-300 p-6 flex flex-col justify-between group">
      
      <div>
        {/* Top category & applicability status badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-50 text-brand-800 border border-blue-100 uppercase tracking-wider">
            {approval.category || 'General Approval'}
          </span>
          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border tracking-wide uppercase ${getStatusStyle(displayStatus)}`}>
            {t(statusTranslationMap[displayStatus] || displayStatus, displayStatus)}
          </span>
        </div>

        {/* Approval Name */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug">
          {approval.name}
        </h3>

        {/* Authority / Department */}
        <div className="mt-2.5 flex items-start space-x-2 text-xs text-slate-700">
          <Landmark className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
          <div className="font-semibold text-slate-800 leading-tight">
            <span className="text-slate-400 font-normal">{t('approvals.authority', 'Authority')}: </span>
            {approval.authority || approval.department}
          </div>
        </div>

        {/* Applicability clause */}
        <div className="mt-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
          <span className="font-bold text-slate-800">{t('approvals.applicability', 'Applicability')}: </span>
          {approval.applicability}
        </div>

        {/* Required Documents count */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>{t('approvals.officialSource', 'Official Source')}: <strong className="text-slate-700">{approval.officialSource || 'Statutory Act'}</strong></span>
          <span>{t('approvals.docsCount', '{count} Docs', { count: approval.requiredDocs?.length || 4 })}</span>
        </div>
      </div>

      {/* Action Buttons as specified in Rule 15 & 6 */}
      <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <button
          onClick={() => onViewDetails(approval)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center space-x-1 cursor-pointer"
        >
          <span>{t('approvals.viewDetails', 'View Details')}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Official Source Button as specified in Rule 6 */}
        {approval.sourceUrl ? (
          <a
            href={approval.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open verified official government authority portal"
            className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-brand-700 font-bold text-xs border border-brand-200 hover:border-brand-400 transition-colors flex items-center space-x-1"
          >
            <span>{t('approvals.officialSource', 'Official Source')}</span>
            <ExternalLink className="w-3 h-3 text-brand-600" />
          </a>
        ) : (
          <span 
            className="py-2.5 px-2.5 rounded-xl bg-slate-50 text-slate-400 text-[11px] font-medium border border-slate-200 cursor-not-allowed"
            title="Official portal URL is not currently verified in application database"
          >
            {t('approvals.sourceUnavailable', 'Official source unavailable')}
          </span>
        )}
      </div>

    </div>
  );
};
