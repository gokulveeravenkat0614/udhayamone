import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { authApi, setAuthSession } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

export const RegisterPage = ({ 
  onRegisterSuccess, 
  onNavigate 
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    if (!name.trim()) {
      return 'Please enter your Full Name or Company Representative Name';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      return 'Please enter a valid 10-digit mobile number';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const validationErr = validateForm();
    if (validationErr) {
      setErrorMessage(validationErr);
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.register(
        name.trim(),
        email.trim().toLowerCase(),
        mobile.replace(/[^0-9]/g, ''),
        password,
        confirmPassword
      );

      if (res && res.success && res.token) {
        setAuthSession(res.token, res.user);
        if (onRegisterSuccess) {
          onRegisterSuccess(res.user, res.token);
        } else if (onNavigate) {
          onNavigate('/dashboard');
        }
      } else {
        setErrorMessage(res?.message || 'Registration failed. Please check your inputs.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      if (err.status === 409) {
        setErrorMessage(serverMsg || 'An account with this email or mobile number already exists. Please sign in instead.');
      } else if (err.status === 400) {
        setErrorMessage(serverMsg || 'Invalid registration details. Please check the form.');
      } else if (err.status === 404) {
        setErrorMessage(serverMsg || 'Registration endpoint not found (404). Please verify backend configuration.');
      } else if (err.status >= 500) {
        setErrorMessage(serverMsg || 'Server error. Please try again later.');
      } else {
        setErrorMessage(serverMsg || 'Unable to connect to application service. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-lg w-full space-y-8">
        
        {/* Back to Home Link */}
        <div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/')}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-brand-700 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" />
            {t('auth.backToHome', 'Back to Home')}
          </button>
        </div>

        {/* Brand & Heading */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-900 via-brand-800 to-blue-600 text-white shadow-lg shadow-brand-900/20 mb-4 ring-4 ring-blue-100">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            {t('auth.registerTitle', 'Create your UdyamOne Account')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {t('auth.registerSubtitle', 'Single-window industrial approval workspace for your business')}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white py-8 px-6 sm:px-8 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80">
          
          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('auth.fullName', 'Full Name / Business Legal Representative')} <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vikramaditya Sharma / ABC Mfg Ltd"
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('auth.email', 'Email Address')} <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@enterprise.in"
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('auth.mobile', 'Mobile Number (10 digits)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="9820144521"
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('auth.password', 'Password (min. 6 characters)')} <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="block w-full pl-10 pr-12 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {t('auth.confirmPassword', 'Confirm Password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-md shadow-brand-700/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{t('auth.registering', 'Creating account...')}</span>
                  </span>
                ) : (
                  <span>{t('auth.registerBtn', 'Register Enterprise')}</span>
                )}
              </button>
            </div>

          </form>

          {/* Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
            <p>
              {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/login')}
                className="font-bold text-brand-700 hover:text-brand-800 underline underline-offset-2 cursor-pointer"
              >
                {t('auth.logInBtn', 'Log In')}
              </button>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
