import React, { useState } from 'react';
import { X, Building2, ShieldCheck, UserCheck, ArrowRight, Lock, Mail, Briefcase, Phone, Loader2 } from 'lucide-react';
import { authApi, setAuthSession } from '../services/api';

export const AuthModal = ({ isOpen, initialMode = 'login', onClose, onAuthenticated }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let r;
      if (mode === 'login') {
        r = await authApi.login(email.trim(), password);
      } else {
        const cleanMobile = mobile.replace(/[^0-9]/g, '');
        if (cleanMobile.length < 10) {
          setError('Please enter a valid 10-digit mobile number');
          setLoading(false);
          return;
        }
        r = await authApi.register(
          name.trim(),
          email.trim().toLowerCase(),
          cleanMobile,
          password,
          password
        );
      }

      if (r && r.token) {
        setAuthSession(r.token, r.user);
        if (onAuthenticated) onAuthenticated(r.user);
        if (onClose) onClose();
      } else {
        setError(r?.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      if (err.status === 409) {
        setError('An account with this email or mobile number already exists.');
      } else if (err.status === 401) {
        setError('Invalid email or password.');
      } else {
        setError(serverMsg || 'Unable to connect to application service.');
      }
    } finally {
      setLoading(false);
    }
  };

  const demo = async (role) => {
    const creds = role === 'admin' ? ['admin@udyamone.test', 'Admin@123'] : ['demo@udyamone.test', 'Password@123'];
    setLoading(true);
    setError('');
    try {
      const r = await authApi.login(...creds);
      if (r && r.token) {
        setAuthSession(r.token, r.user);
        if (onAuthenticated) onAuthenticated(r.user);
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Demo login failed. Make sure backend is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 z-10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-brand-950 to-brand-900 text-white p-7 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-2xl font-black">{mode === 'login' ? 'Login to UdyamOne' : 'Register New Enterprise'}</h3>
          <p className="text-xs text-blue-200 mt-1">Single-window industrial approval workspace</p>
        </div>

        <div className="p-5 bg-slate-50 border-b space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase text-center">Quick Demo Accounts</div>
          <button
            type="button"
            disabled={loading}
            onClick={() => demo('user')}
            className="w-full p-3 rounded-xl bg-white border text-left flex items-center justify-between hover:bg-blue-50 cursor-pointer"
          >
            <span className="flex items-center gap-2 text-xs font-bold">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Applicant demo
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => demo('admin')}
            className="w-full p-3 rounded-xl bg-white border text-left flex items-center justify-between hover:bg-amber-50 cursor-pointer"
          >
            <span className="flex items-center gap-2 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" /> Admin demo
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-bold mb-1">Full Name / Enterprise</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-hidden"
                    placeholder="Vikramaditya Sharma"
                  />
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Mobile Number (10 digits)</label>
                <div className="relative">
                  <input
                    required
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-hidden"
                    placeholder="9820144521"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-bold mb-1">Email</label>
            <div className="relative">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-hidden"
                placeholder="contact@enterprise.in"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Password</label>
            <div className="relative">
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-hidden"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 p-3 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold flex justify-center items-center gap-2 shadow-md cursor-pointer transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
          </button>

          <div className="text-center text-slate-500 pt-2">
            {mode === 'login' ? (
              <>
                No account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="font-bold text-brand-700 hover:underline cursor-pointer"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="font-bold text-brand-700 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

