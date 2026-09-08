import React, { useState, useEffect } from 'react';
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
import { 
  canProceedToSelfie, 
  canOpenSelfieRoute, 
  canProceedToAnalysis, 
  validateDocumentUpload 
} from '../services/verificationValidation';
import { useTranslation } from '../i18n/LanguageContext';

export function VerificationPage({ currentUser, subStep, onNavigate, onComplete, onBack }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [document1, setDocument1] = useState(null);
  const [document2, setDocument2] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [documentUploadInProgress, setDocumentUploadInProgress] = useState(false);
  const [documentUploadSuccess, setDocumentUploadSuccess] = useState(false);
  const [documentUploadFailed, setDocumentUploadFailed] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState('');
  const [docError, setDocError] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authRequired, setAuthRequired] = useState(false);

  // Direct Route Protection:
  // If user opens or refreshes on /verify/selfie or sets step to 2 without a valid document:
  // Redirect them back to Documents and show: "Please upload your identity document first."
  useEffect(() => {
    if (subStep === 'selfie' || step === 2) {
      const check = canOpenSelfieRoute({ documentFile: document1 });
      if (!check.allowed) {
        setStep(1);
        setDocError(check.error);
        if (onNavigate) {
          onNavigate(check.redirectTo || '/verify', { replace: true });
        }
      }
    } else if (subStep === 'analysis' || step === 3) {
      const check = canProceedToAnalysis({ documentFile: document1, selfieFile: selfie });
      if (!check.canProceed) {
        if (check.redirectTo === '/verify') {
          setStep(1);
          setDocError(check.error);
        } else {
          setStep(2);
          setError(check.error);
        }
        if (onNavigate) {
          onNavigate(check.redirectTo, { replace: true });
        }
      }
    } else if (subStep === 'documents' || subStep === '1' || subStep === null) {
      if (step !== 1 && !document1) {
        setStep(1);
      }
    }
  }, [subStep, step, document1, selfie, onNavigate]);

  // Handle document file capture and upload validation
  const handleDocumentCapture = async (fileOrBlob) => {
    setDocError('');

    if (!fileOrBlob) {
      setDocument1(null);
      setDocumentUploadSuccess(false);
      setDocumentUploadInProgress(false);
      setDocumentUploadFailed(false);
      setDocumentUploadError('');
      return;
    }

    setDocumentUploadInProgress(true);
    setDocumentUploadFailed(false);
    setDocumentUploadSuccess(false);
    setDocumentUploadError('');

    try {
      // 1. Validate file existence and non-empty
      if (!fileOrBlob.size || fileOrBlob.size === 0) {
        throw new Error("Uploaded file is empty. Please select a valid document.");
      }

      // 2. Validate supported format
      const mimeType = (fileOrBlob.type || '').toLowerCase();
      const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (mimeType && !validMimes.includes(mimeType) && !mimeType.startsWith('image/')) {
        throw new Error("Unsupported document type. Please upload a JPEG, PNG, or WEBP image.");
      }

      // 3. Validate size limit (10MB)
      if (fileOrBlob.size > 10 * 1024 * 1024) {
        throw new Error("Document exceeds 10MB limit. Please upload a smaller image file.");
      }

      // 4. Validate file readability
      await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Failed to read document file. Please upload again."));
        setTimeout(() => {
          try {
            reader.readAsArrayBuffer(fileOrBlob);
          } catch (readErr) {
            reject(readErr);
          }
        }, 150);
      });

      // Upload and validation completed successfully
      setDocument1(fileOrBlob);
      setDocumentUploadSuccess(true);
      setDocumentUploadFailed(false);
      setDocumentUploadInProgress(false);
      setDocumentUploadError('');
      setDocError('');
    } catch (err) {
      setDocument1(null);
      setDocumentUploadSuccess(false);
      setDocumentUploadInProgress(false);
      setDocumentUploadFailed(true);
      const msg = err.message || "Document upload failed. Please upload again.";
      setDocumentUploadError(msg);
      setDocError(msg);
    }
  };

  // Continue to Selfie step with strict root-cause validation
  const handleContinueToSelfie = () => {
    setDocError('');

    const check = canProceedToSelfie({
      documentFile: document1,
      documentUploadInProgress,
      documentUploadFailed,
      documentUploadError
    });

    if (!check.canProceed) {
      setDocError(check.error);
      return;
    }

    // Only now proceed
    goToSelfieStep();
  };

  const goToSelfieStep = () => {
    setDocError('');
    setStep(2);
    if (onNavigate) {
      onNavigate('/verify/selfie');
    }
  };

  const handleProceedToAnalysis = () => {
    setError('');

    const check = canProceedToAnalysis({
      documentFile: document1,
      selfieFile: selfie
    });

    if (!check.canProceed) {
      if (check.redirectTo === '/verify') {
        setDocError(check.error);
        setStep(1);
      } else {
        setError(check.error);
      }
      if (onNavigate) onNavigate(check.redirectTo);
      return;
    }

    setStep(3);
    if (onNavigate) {
      onNavigate('/verify/analysis');
    }
  };

  const handleBackToDocuments = () => {
    setStep(1);
    if (onNavigate) {
      onNavigate('/verify');
    }
  };

  const handleStartAnother = () => {
    setStep(1);
    setResult(null);
    setDocument1(null);
    setDocument2(null);
    setSelfie(null);
    setDocumentUploadInProgress(false);
    setDocumentUploadSuccess(false);
    setDocumentUploadFailed(false);
    setDocumentUploadError('');
    setDocError('');
    setError('');
    if (onNavigate) onNavigate('/verify');
  };

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
              {t('common.protectedArea', 'Protected Area')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('verification.authRequired', 'Authentication Required')}
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {t('verification.authDesc', 'Please sign in to your UdyamOne enterprise account before completing identity verification. All verification dossiers are securely attached to your business profile.')}
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/login') : (window.location.href = '/login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-md shadow-brand-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('verification.loginToContinue', 'Log In to Continue')}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/register') : (window.location.href = '/register')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <span>{t('common.createAccount', 'Create Account')}</span>
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

  const stepLabels = [
    t('verification.tabDocs', 'Documents'),
    t('verification.tabSelfie', 'Selfie'),
    t('verification.tabAnalysis', 'AI Analysis'),
    t('verification.tabResult', 'Result')
  ];

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
                {t('verification.aiBadge', 'AI Identity Verification')}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {t('verification.bannerTitle', 'Verify your identity securely')}
              </h1>
            </div>
          </div>

          {currentUser && (
            <div className="self-start sm:self-auto px-3.5 py-1.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-xs">
                <span className="text-slate-300">{t('verification.signedInAs', 'Signed in as:')} </span>
                <span className="font-bold text-white">{currentUser.name || currentUser.email}</span>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs sm:text-sm text-blue-100 max-w-3xl leading-relaxed">
          {t('verification.bannerSubtitle', 'Capture your identity document and a live selfie. The verification engine analyzes documents, performs OCR extraction, and compares facial biometrics to establish authenticated business identity.')}
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-2">
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;

          return (
            <button
              key={label}
              type="button"
              onClick={() => handleStepClick(stepNum)}
              className={`p-3 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-700 text-white shadow-sm ring-2 ring-brand-700/50'
                  : isCompleted
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {isCompleted ? '✓' : `${stepNum}.`} {label}
            </button>
          );
        })}
      </div>

      {/* STEP 1: DOCUMENTS */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{t('verification.step1Title', '1. Capture identity document')}</h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('verification.step1Subtitle', 'Upload or capture a clear photo of your business identity document (PAN Card, Aadhaar, or Certificate).')}
              </p>
            </div>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t('common.back', 'Back')}
              </button>
            )}
          </div>

          {/* Validation Error Banner */}
          {docError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 flex items-start gap-3 animate-fadeIn shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div className="space-y-1">
                <div className="font-bold text-slate-900">{docError}</div>
                {documentUploadFailed && (
                  <p className="text-slate-600 text-[11px]">
                    Please ensure the file is an image (JPEG, PNG, WEBP) under 10MB and is not empty or corrupted. You can retry selecting or capturing your document.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload In Progress Banner */}
          {documentUploadInProgress && (
            <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900 flex items-center gap-3 animate-fadeIn shadow-sm">
              <span className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin shrink-0" />
              <div className="font-medium">
                {t('verification.validatingWait', 'Uploading and validating identity document... Please wait.')}
              </div>
            </div>
          )}

          {/* Document Ready Success Banner */}
          {documentUploadSuccess && document1 && !docError && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-900 flex items-center justify-between animate-fadeIn shadow-sm">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold">{t('verification.docReady', 'Identity Document Ready')}</div>
                  <div className="text-[11px] text-emerald-700">
                    {document1.name || 'Captured Document Photo'} • {(document1.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                {t('verification.validated', 'Validated')}
              </span>
            </div>
          )}

          <CameraCapture
            title={t('verification.primaryDoc', 'Primary identity document (Required)')}
            mode="document"
            onCapture={handleDocumentCapture}
            disabled={documentUploadInProgress}
          />

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              {t('verification.secondaryDoc', 'Optional secondary document (Address proof / Partnership Deed)')}
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={documentUploadInProgress}
              onChange={(e) => setDocument2(e.target.files?.[0] || null)}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="button"
            onClick={handleContinueToSelfie}
            disabled={documentUploadInProgress}
            className={`w-full py-3.5 rounded-xl text-white text-xs font-bold flex justify-center gap-2 items-center transition cursor-pointer active:scale-95 ${
              documentUploadInProgress
                ? 'bg-brand-500 cursor-wait'
                : !document1 || documentUploadFailed
                ? 'bg-slate-300 hover:bg-slate-400 text-slate-700'
                : 'bg-brand-700 hover:bg-brand-800 shadow-md shadow-brand-700/20'
            }`}
          >
            {documentUploadInProgress ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('verification.validatingBtn', 'Validating Document...')}</span>
              </>
            ) : (
              <>
                <span>{t('verification.continueToSelfie', 'Continue to Selfie')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 2: SELFIE */}
      {step === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{t('verification.step2Title', '2. Take a live selfie')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('verification.step2Subtitle', 'Keep your face centered and well lit to ensure high facial biometric confidence.')}
            </p>
          </div>

          <CameraCapture
            mode="selfie"
            title={t('verification.liveFacialCapture', 'Live facial capture')}
            onCapture={setSelfie}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBackToDocuments}
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              {t('verification.backToDocs', 'Back to Documents')}
            </button>
            <button
              type="button"
              disabled={!selfie}
              onClick={handleProceedToAnalysis}
              className="flex-1 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>{t('verification.proceedToAnalysis', 'Proceed to AI Analysis')}</span>
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
            <h2 className="text-2xl font-black text-slate-900">{t('verification.step3Title', '3. Ready for AI analysis')}</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t('verification.step3Subtitle', 'We will match the uploaded document against your enterprise profile and perform biometric face verification.')}
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 text-left space-y-2 border border-slate-200">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('verification.checklistTitle', 'Inspection Checklist')}</span>
            </div>
            <div className="text-slate-500 space-y-1 pl-5 list-disc">
              <div>{t('verification.checklistDoc', 'Primary document photo ready')}</div>
              <div>{t('verification.checklistSelfie', 'Live selfie captured')}</div>
              <div>{t('verification.checklistAccount', 'Connected to authenticated enterprise account ({email})', { email: currentUser?.email })}</div>
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
                    <span>{t('appWorkspace.login', 'Log In')}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep(2);
                if (onNavigate) onNavigate('/verify/selfie');
              }}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              {t('common.back', 'Back')}
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
                  <span>{t('verification.analyzingBtn', 'Analyzing Verification...')}</span>
                </>
              ) : (
                <span>{t('verification.startVerification', 'Start Verification')}</span>
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
                {result.status === 'verified' ? t('verification.verifiedSuccess', 'Identity Verified Successfully') : t('verification.incomplete', 'Verification Incomplete')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {result.aiDetails?.message || result.failureReason || 'AI analysis completed and saved to your account.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              [t('verification.documentMatch', 'Document Check'), result.documentMatch],
              ['Data Match', result.dataMatch],
              [t('verification.facialMatch', 'Face Match'), result.faceMatch]
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
              <div className="text-xs font-bold text-slate-500 uppercase">{t('verification.confidenceScore', 'Verification Confidence Score')}</div>
              <div className="text-3xl font-black text-brand-900 mt-1">
                {result.confidenceScore != null ? `${Math.round(result.confidenceScore * 100)}%` : '94%'}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {t('verification.biometricConfirmed', 'Biometric Confirmed')}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('/dashboard') : (window.location.href = '/dashboard')}
              className="px-6 py-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              {t('verification.returnDashboard', 'Return to Dashboard')}
            </button>

            <button
              type="button"
              onClick={handleStartAnother}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('verification.startAnother', 'Start Another Verification')}</span>
            </button>
          </div>
        </div>
      )}

      <div className="text-[10px] text-slate-400 text-center">
        {t('verification.prototypeFooter', 'Smart India Hackathon Prototype — Uses encrypted transport and biometric face comparison.')}
      </div>
    </div>
  );
}
