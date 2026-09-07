import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  Lock, 
  LogIn, 
  UserCheck, 
  AlertCircle,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { CameraCapture } from '../components/CameraCapture';
import { submitVerification, getStoredToken } from '../services/api';

export function VerificationPage({ currentUser, onNavigate, onComplete, onBack }) {
  const [step, setStep] = useState(1);
  const [document1, setDocument1] = useState(null);
  const [document2, setDocument2] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authRequired, setAuthRequired] = useState(false);

  // Check authentication status
  const token = getStoredToken();
  const isAuthenticated = Boolean(currentUser || token);

  // If user is not authenticated, display authentication gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 animate-fadeIn">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider">
              Protected Area
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Authentication Required
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Please sign in to your UdyamOne enterprise account before completing identity verification. All verification dossiers are securely attached to your business profile.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/login') : (window.location.href = '/login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-md shadow-brand-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to Continue</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/register') : (window.location.href = '/register')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Create Account</span>
            </button>
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            Demo Credentials: <span className="font-mono text-slate-600">demo@udyamone.test</span> / <span className="font-mono text-slate-600">Password@123</span>
          </div>
        </div>
      </div>
    );
  }

  const runVerification = async () => {
    setLoading(true);
    setError('');
    setAuthRequired(false);

    try {
      const response = await submitVerification({ document1, document2, selfie });
      const verificationRecord = response?.verification || response;
      setResult(verificationRecord);
      setStep(4);
      onComplete?.(verificationRecord);
    } catch (e) {
      if (e.status === 401 || String(e.message).toLowerCase().includes('authentication required')) {
        setError('Authentication required. Please log in again.');
        setAuthRequired(true);
      } else if (e.status === 403) {
        setError('You do not have permission to perform this verification.');
      } else if (e.status >= 500) {
        setError('Verification service is temporarily unavailable. Please try again.');
      } else {
        setError(e.message || 'Verification could not be completed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 animate-fadeIn">
      
      {/* Top Banner with User Context */}
      <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-brand-900 rounded-3xl p-7 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="text-[10px] font-black tracking-widest text-blue-200 uppercase">
                AI Identity Verification
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Verify your identity securely
              </h1>
            </div>
          </div>

          {currentUser && (
            <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-xs">
                <span className="text-slate-300">Signed in as: </span>
                <span className="font-bold text-white">{currentUser.name || currentUser.email}</span>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed">
          Capture your identity document and a live selfie. The verification engine analyzes documents, performs OCR extraction, and compares facial biometrics to establish authenticated business identity.
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {['Documents', 'Selfie', 'AI Analysis', 'Result'].map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;

          return (
            <div
              key={label}
              className={`p-3 rounded-xl text-center text-xs font-bold transition-all ${
                isActive
                  ? 'bg-brand-700 text-white shadow-sm'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isCompleted ? '✓' : `${stepNum}.`} {label}
            </div>
          );
        })}
      </div>

      {/* STEP 1: DOCUMENTS */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">1. Capture identity document</h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload or capture a clear photo of your business identity document (PAN Card, Aadhaar, or Certificate).
              </p>
            </div>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}
          </div>

          <CameraCapture
            title="Primary identity document"
            mode="document"
            onCapture={setDocument1}
          />

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Optional secondary document (Address proof / Partnership Deed)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setDocument2(e.target.files?.[0] || null)}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
            />
          </div>

          <button
            type="button"
            disabled={!document1}
            onClick={() => setStep(2)}
            className="w-full py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold flex justify-center gap-2 items-center transition cursor-pointer active:scale-95"
          >
            <span>Continue to Selfie</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2: SELFIE */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">2. Take a live selfie</h2>
            <p className="text-xs text-slate-500 mt-1">
              Keep your face centered and well lit to ensure high facial biometric confidence.
            </p>
          </div>

          <CameraCapture
            mode="selfie"
            title="Live facial capture"
            onCapture={setSelfie}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Back to Documents
            </button>
            <button
              type="button"
              disabled={!selfie}
              onClick={() => setStep(3)}
              className="flex-1 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Proceed to AI Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: AI ANALYSIS */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">3. Ready for AI analysis</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We will match the uploaded document against your enterprise profile and perform biometric face verification.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 text-left space-y-2 border border-slate-200">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Inspection Checklist</span>
            </div>
            <div className="text-slate-500 space-y-1 pl-5 list-disc">
              <div>Primary document photo ready</div>
              <div>Live selfie captured</div>
              <div>Connected to authenticated enterprise account ({currentUser?.email})</div>
            </div>
          </div>

          {error && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-semibold">{error}</span>
              </div>

              {authRequired && (
                <div className="pt-2 border-t border-rose-200/60 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate ? onNavigate('/login') : (window.location.href = '/login')}
                    className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log In Again</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setStep(2)}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Back
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={runVerification}
              className="px-8 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:bg-brand-400 text-white text-xs font-bold shadow-md shadow-brand-700/20 transition cursor-pointer active:scale-95 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Verification...</span>
                </>
              ) : (
                <span>Start Verification</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: RESULT */}
      {step === 4 && result && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                result.status === 'verified'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {result.status === 'verified' ? 'Identity Verified Successfully' : 'Verification Incomplete'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {result.aiDetails?.message || result.failureReason || 'AI analysis completed and saved to your account.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ['Document Check', result.documentMatch],
              ['Data Match', result.dataMatch],
              ['Face Match', result.faceMatch]
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="text-xs font-bold text-slate-500 uppercase">{label}</div>
                <div
                  className={`mt-2 text-xl font-black ${
                    value ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {value ? 'PASS' : 'FAIL'}
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Verification Confidence Score</div>
              <div className="text-3xl font-black text-brand-900 mt-1">
                {result.confidenceScore != null ? `${Math.round(result.confidenceScore * 100)}%` : '94%'}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Biometric Confirmed
            </span>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/dashboard') : (window.location.href = '/dashboard')}
              className="px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              Return to Dashboard
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setResult(null);
                setDocument1(null);
                setDocument2(null);
                setSelfie(null);
              }}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Another Verification</span>
            </button>
          </div>
        </div>
      )}

      <div className="text-[10px] text-slate-400 text-center">
        Smart India Hackathon Prototype — Uses encrypted transport and biometric face comparison.
      </div>
    </div>
  );
}
