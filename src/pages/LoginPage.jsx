import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { authApi, setAuthSession } from '../services/api';

export const LoginPage = ({ 
  onLoginSuccess, 
  onNavigate, 
  initialEmail = '',
  successMessage = '' 
}) => {
  const [identifier, setIdentifier] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState(successMessage || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your email address or 10-digit mobile number');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.login(trimmed, password);
      if (res && res.success && res.token) {
        setAuthSession(res.token, res.user);
        if (onLoginSuccess) {
          onLoginSuccess(res.user, res.token);
        } else if (onNavigate) {
          onNavigate('/dashboard');
        }
      } else {
        setErrorMessage(res?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      if (err.status === 401) {
        setErrorMessage(serverMsg || 'Invalid email/mobile or password.');
      } else if (err.status === 404) {
        setErrorMessage(serverMsg || 'Account not found. Please check your credentials or register.');
      } else if (err.status >= 500) {
        setErrorMessage(serverMsg || 'Server error. Please try again later.');
      } else {
        setErrorMessage(serverMsg || 'Login failed. Invalid email/mobile or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (autoSubmit = false) => {
    setIdentifier('demo@udyamone.test');
    setPassword('Password@123');
    setErrorMessage('');
    setInfoMessage('Demo credentials filled!');
    if (autoSubmit) {
      setTimeout(() => {
        authApi.login('demo@udyamone.test', 'Password@123')
          .then(res => {
            if (res && res.success && res.token) {
              setAuthSession(res.token, res.user);
              if (onLoginSuccess) onLoginSuccess(res.user, res.token);
              else if (onNavigate) onNavigate('/dashboard');
            }
          })
          .catch(err => setErrorMessage(err.message));
      }, 50);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-md w-full space-y-8">
        
        {/* Back to Home Link */}
        <div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/')}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-700 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>
        </div>

        {/* Brand & Heading */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-900 via-brand-800 to-blue-600 text-white shadow-lg shadow-brand-900/20 mb-4 ring-4 ring-blue-100">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Sign In to <span className="text-brand-700">UdyamOne</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Access your personal single-window industrial approval workspace
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80">
          
          {/* Error message banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Info message banner */}
          {infoMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="font-medium">{infoMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email or Mobile */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email or Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@company.com or 9820144521"
                  autoComplete="username"
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Password with Show/Hide Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-12 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <span className="flex items-center space-x-1">
                      <EyeOff className="w-4 h-4 text-slate-400" />
                      <span className="text-[11px]">Hide</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span className="text-[11px]">Show</span>
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-md shadow-brand-700/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Signing In...</span>
                  </span>
                ) : (
                  <span>Log In</span>
                )}
              </button>
            </div>
          </form>

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/register')}
                className="font-bold text-brand-700 hover:text-brand-800 underline underline-offset-2 cursor-pointer"
              >
                Register
              </button>
            </p>
          </div>

          {/* Demo Credentials Box */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Account</span>
              </span>
              <button
                type="button"
                onClick={() => handleFillDemo(false)}
                className="text-[11px] font-bold text-brand-800 bg-white hover:bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Auto-fill Form
              </button>
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-700">
              <div>
                <span className="text-slate-500">Email:</span>{' '}
                <strong className="text-slate-900">demo@udyamone.test</strong>
              </div>
              <div>
                <span className="text-slate-500">Password:</span>{' '}
                <strong className="text-slate-900">Password@123</strong>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
              <span className="text-amber-800 text-[10px]">Instant access to pre-evaluated applications</span>
              <button
                type="button"
                onClick={() => handleFillDemo(true)}
                className="font-bold text-brand-700 hover:underline cursor-pointer"
              >
                One-Click Sign In &rarr;
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
