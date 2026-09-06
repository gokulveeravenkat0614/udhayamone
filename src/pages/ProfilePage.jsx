import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  LogOut, 
  ArrowLeft, 
  Calendar, 
  Layers, 
  Clock, 
  CheckCircle2,
  Building2
} from 'lucide-react';
import { applicationApi, clearAuthSession } from '../services/api';

export const ProfilePage = ({ 
  currentUser, 
  onLogout, 
  onNavigate 
}) => {
  const [appStats, setAppStats] = useState({
    total: 0,
    active: 0,
    completed: 0
  });

  useEffect(() => {
    applicationApi.getMyApplications()
      .then(res => {
        if (res && res.success && res.applications) {
          const apps = res.applications;
          setAppStats({
            total: apps.length,
            active: apps.filter(a => a.status === 'In Progress').length,
            completed: apps.filter(a => a.status === 'Completed' || a.status === 'Submitted').length
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleLogoutClick = () => {
    clearAuthSession();
    if (onLogout) {
      onLogout();
    } else if (onNavigate) {
      onNavigate('/login');
    }
  };

  const clientId = currentUser?.id 
    ? `CLT-${String(currentUser.id).slice(-6).toUpperCase()}` 
    : 'CLT-DEMO01';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-700 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-900 to-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-md ring-4 ring-blue-50">
            {(currentUser?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser?.name || 'Enterprise Client'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-brand-800 border border-blue-200 uppercase">
                {currentUser?.role || 'Client'}
              </span>
            </div>
            <p className="text-xs font-mono text-brand-700 font-bold mt-1">
              Client ID: {clientId}
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={handleLogoutClick}
            className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Applications Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-700 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Total Applications</div>
            <div className="text-2xl font-black text-slate-900">{appStats.total}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Active In-Progress</div>
            <div className="text-2xl font-black text-amber-600">{appStats.active}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase">Completed / Submitted</div>
            <div className="text-2xl font-black text-emerald-600">{appStats.completed}</div>
          </div>
        </div>
      </div>

      {/* Account Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Account Details</h2>
          <p className="text-xs text-slate-500 mt-0.5">Your official account credentials and contact points</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center text-xs font-bold text-slate-500">
              <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <span>Full Name / Entity Name</span>
            </div>
            <div className="text-sm font-bold text-slate-900">{currentUser?.name || 'Not provided'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center text-xs font-bold text-slate-500">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <span>Official Email Address</span>
            </div>
            <div className="text-sm font-bold text-slate-900">{currentUser?.email || 'Not provided'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center text-xs font-bold text-slate-500">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <span>Registered Mobile</span>
            </div>
            <div className="text-sm font-bold text-slate-900">{currentUser?.mobile || '+91 98201 44521'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center text-xs font-bold text-slate-500">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <span>Account Member Since</span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {currentUser?.createdAt 
                ? new Date(currentUser.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
                : 'July 2026'}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Single-Window Authentication & Encrypted Storage active</span>
          </div>
          <button
            onClick={() => onNavigate('/my-applications')}
            className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            View All Applications &rarr;
          </button>
        </div>
      </div>

    </div>
  );
};
