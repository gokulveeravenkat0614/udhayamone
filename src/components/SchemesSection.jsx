import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  AlertCircle, 
  Coins, 
  ChevronRight, 
  X,
  Check
} from 'lucide-react';
import { SCHEMES_DATA } from '../data/schemesData';
import { useTranslation } from '../i18n/LanguageContext';

export const SchemesSection = ({ selectedIndustry = "Manufacturing", selectedState = "Maharashtra" }) => {
  const { t } = useTranslation();
  const [schemes] = useState(SCHEMES_DATA);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState(null);
  
  // Interactive Eligibility Quiz State
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [quizInvestment, setQuizInvestment] = useState('under_1cr');
  const [quizTurnover, setQuizTurnover] = useState('under_5cr');
  const [quizEntityType, setQuizEntityType] = useState('pvt_ltd');
  const [quizResult, setQuizResult] = useState(null);

  const categories = ['All', 'MSME Support', 'Startup Support', 'Technology Upgrade', 'Employment Incentives', 'Green Manufacturing', 'Export Assistance'];

  const categoryMap = {
    'All': 'schemes.categories.all',
    'MSME Support': 'schemes.categories.msmeSupport',
    'Startup Support': 'schemes.categories.startupSupport',
    'Technology Upgrade': 'schemes.categories.technologyUpgrade',
    'Employment Incentives': 'schemes.categories.employmentIncentives',
    'Green Manufacturing': 'schemes.categories.greenManufacturing',
    'Export Assistance': 'schemes.categories.exportAssistance'
  };

  const filteredSchemes = schemes.filter(s => {
    if (activeCategory === 'All') return true;
    return s.category === activeCategory;
  });

  const handleRunAssessment = (e) => {
    e.preventDefault();
    setQuizResult({
      status: 'Highly Eligible',
      msmeClass: quizInvestment === 'under_1cr' ? 'Micro Enterprise' : quizInvestment === 'under_10cr' ? 'Small Enterprise' : 'Medium Enterprise',
      matchedSchemes: [
        'MSME Priority Credit & Collateral Guarantee (CGTMSE)',
        'Zero Defect Zero Effect (ZED) Green Subsidy',
        'Credit Linked Capital Subsidy (CLCSS)'
      ],
      estimatedIncentive: quizInvestment === 'under_1cr' ? 'Up to ₹15 Lakh Capital Subsidy + 80% ZED Reimbursement' : 'Up to ₹50 Lakh Capital Subsidy + Interest Subvention'
    });
  };

  return (
    <div id="schemes-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('schemes.incentivesDesk', 'Incentives & Subsidies Desk')}</span>
              <span className="text-amber-400/50">•</span>
              <span className="text-amber-200">{t('schemes.demoData', 'Demonstration Data')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {t('schemes.title', 'Government Support You May Be Eligible For')}
            </h2>

            <p className="text-blue-100 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              {t('schemes.subtitle', 'Explore Central and State incentive schemes, collateral-free credit facilities, technology upgradation grants, and green manufacturing subsidies.')}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => {
                setEligibilityModalOpen(true);
                setQuizResult(null);
              }}
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <Coins className="w-4 h-4" />
              <span>{t('schemes.runQuizBtn', 'Run Quick Eligibility Checker →')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demonstration Data Alert Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>{t('schemes.demoNoticeTitle', 'Demonstration / Prototype Notice')}:</strong> {t('schemes.disclaimer', 'Scheme terms, subsidy limits, and eligibility matrices shown below are representative demonstration data for the Smart India Hackathon MVP prototype.')}
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 shrink-0 hidden sm:inline">
          SIH 2026
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs font-semibold">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
              activeCategory === cat
                ? 'bg-brand-900 text-white shadow-xs font-bold'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {t(categoryMap[cat] || cat, cat)}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map((scheme) => (
          <div 
            key={scheme.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Header: Category Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-50 text-brand-800 border border-blue-100">
                  {t(categoryMap[scheme.category] || scheme.category, scheme.category)}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t('common.active', 'Active')}
                </span>
              </div>

              {/* Scheme Name */}
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug">
                {scheme.name}
              </h3>

              {/* Ministry */}
              <div className="text-xs font-semibold text-slate-500 mt-1">
                {scheme.ministry}
              </div>

              {/* Short Description */}
              <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {scheme.shortDescription}
              </p>

              {/* Eligibility Indicator */}
              <div className="mt-4 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 text-xs flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{t('schemes.eligibility', 'Eligibility')}: </span>
                  <span>{scheme.eligibilityIndicator}</span>
                </div>
              </div>

              {/* Key Benefit Highlight */}
              <div className="mt-3 text-xs text-slate-600">
                <span className="font-bold text-slate-900">{t('schemes.keyBenefit', 'Key Benefit')}: </span>
                <span className="text-brand-800 font-medium">{scheme.benefit}</span>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {scheme.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedSchemeForModal(scheme)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>{t('schemes.checkEligibility', 'Check Eligibility')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {scheme.officialLink && (
                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-brand-700 border border-slate-200 transition-colors"
                  title={t('schemes.officialPortal', 'Official portal')}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Scheme Detail & Eligibility Modal */}
      {selectedSchemeForModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scaleUp relative">
            <button
              onClick={() => setSelectedSchemeForModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={t('common.close', 'Close')}
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
              {t(categoryMap[selectedSchemeForModal.category] || selectedSchemeForModal.category, selectedSchemeForModal.category)}
            </span>

            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {selectedSchemeForModal.name}
            </h3>

            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              {selectedSchemeForModal.ministry}
            </div>

            <div className="mt-5 space-y-4 text-xs text-slate-700">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                <div className="font-bold text-brand-900 mb-1">{t('schemes.incentiveTerms', 'Financial Incentive & Terms')}</div>
                <div>{selectedSchemeForModal.subsidyDetails}</div>
              </div>

              <div>
                <strong className="block text-slate-900 mb-1">{t('schemes.eligibilityVerification', 'Eligibility Verification')}</strong>
                <p className="text-slate-600 leading-relaxed">
                  {t('schemes.eligibilityText', 'Your proposed unit in {state} ({industry}) meets the foundational parameters for this support framework.', {
                    state: t('states.' + selectedState, selectedState),
                    industry: t('industries.' + selectedIndustry, selectedIndustry)
                  })}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500">{t('schemes.nodalAgency', 'Nodal Implementing Agency:')}</span>
                <span className="font-bold text-slate-800">{selectedSchemeForModal.nodalAgency}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedSchemeForModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs"
              >
                {t('common.close', 'Close')}
              </button>

              <a
                href={selectedSchemeForModal.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-brand-700/20"
              >
                <span>{t('schemes.applyPortal', 'Apply via Nodal Portal')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Eligibility Assessment Quiz Modal */}
      {eligibilityModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scaleUp relative">
            <button
              onClick={() => setEligibilityModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
              <Coins className="w-4 h-4" />
              <span>{t('schemes.quiz.title', 'Check Your Scheme Subsidies')}</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900">
              {t('schemes.quiz.title', 'Check Your Scheme Subsidies')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('schemes.quiz.subtitle', 'Answer 3 brief questions to view government subsidies tailored to your project scale.')}
            </p>

            {!quizResult ? (
              <form onSubmit={handleRunAssessment} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {t('schemes.quiz.qInvestment', '1. Proposed Plant & Machinery Capital Investment')}
                  </label>
                  <select
                    value={quizInvestment}
                    onChange={(e) => setQuizInvestment(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="under_1cr">Micro (&lt; ₹1 Crore)</option>
                    <option value="under_10cr">Small (₹1 Crore to ₹10 Crore)</option>
                    <option value="under_50cr">Medium (₹10 Crore to ₹50 Crore)</option>
                    <option value="above_50cr">Large Enterprise (&gt; ₹50 Crore)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {t('schemes.quiz.qTurnover', '2. Expected Annual Turnover (Year 1)')}
                  </label>
                  <select
                    value={quizTurnover}
                    onChange={(e) => setQuizTurnover(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="under_5cr">Up to ₹5 Crore</option>
                    <option value="under_50cr">₹5 Crore to ₹50 Crore</option>
                    <option value="above_50cr">Above ₹50 Crore</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    {t('schemes.quiz.qEntity', '3. Legal Entity Structure')}
                  </label>
                  <select
                    value={quizEntityType}
                    onChange={(e) => setQuizEntityType(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 font-medium"
                  >
                    <option value="pvt_ltd">Private Limited Company</option>
                    <option value="llp">Limited Liability Partnership (LLP)</option>
                    <option value="partnership">Registered Partnership</option>
                    <option value="proprietor">Sole Proprietorship</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEligibilityModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold shadow-md shadow-brand-700/20"
                  >
                    {t('schemes.quiz.runAssessment', 'Evaluate Eligibility')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-4 animate-fadeIn text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>{t('schemes.quiz.classification', 'Classification')}: {quizResult.msmeClass}</span>
                  </div>
                  <div className="mt-2 text-xs text-emerald-900 font-medium">
                    {t('schemes.quiz.potentialIncentives', 'Estimated Benefit')}: <strong>{quizResult.estimatedIncentive}</strong>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 mb-2">{t('schemes.quiz.matchedSchemes', 'Matched Top 3 Central & State Schemes')}:</div>
                  <div className="space-y-2">
                    {quizResult.matchedSchemes.map((name, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2 text-slate-800 font-medium">
                        <Check className="w-4 h-4 text-brand-600 shrink-0" />
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() => setQuizResult(null)}
                    className="text-brand-700 font-bold hover:underline"
                  >
                    ← {t('schemes.quiz.testDifferent', 'Test Different Parameters')}
                  </button>
                  <button
                    onClick={() => setEligibilityModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold"
                  >
                    {t('schemes.quiz.viewCards', 'View Scheme Cards')}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
