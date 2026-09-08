import React, { useState } from 'react';
import { 
  Coins, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  X
} from 'lucide-react';

export const FundingFinder = () => {
  // Input Form State
  const [industry, setIndustry] = useState('Manufacturing');
  const [businessScale, setBusinessScale] = useState('Small');
  const [projectCost, setProjectCost] = useState('50,00,000');
  const [fundingRequired, setFundingRequired] = useState('35,00,000');

  // Results & Modal State
  const [showResults, setShowResults] = useState(false);
  const [selectedLender, setSelectedLender] = useState(null);
  const [demoNoticeVisible, setDemoNoticeVisible] = useState(false);

  // Available options
  const industries = [
    'Manufacturing',
    'Food Processing',
    'Textile',
    'Electronics',
    'Pharma',
    'Automobile',
    'IT / Software'
  ];

  const businessScales = [
    'Micro',
    'Small',
    'Medium',
    'Large'
  ];

  // Potential Lenders Data
  const lenders = [
    {
      id: 'sbi',
      rank: '🥇',
      name: 'SBI',
      fullName: 'State Bank of India',
      loanType: 'MSME Business Loan',
      potentialLoan: '₹10 Lakh – ₹5 Crore*',
      purpose: 'Machinery, Working Capital, Expansion',
      tenure: 'Up to 7 years*'
    },
    {
      id: 'bob',
      rank: '🥈',
      name: 'Bank of Baroda',
      fullName: 'Bank of Baroda',
      loanType: 'MSME Finance',
      potentialLoan: '₹10 Lakh – ₹5 Crore*',
      purpose: 'Equipment, Expansion, Working Capital',
      tenure: 'Up to 7 years*'
    },
    {
      id: 'sidbi',
      rank: '🥉',
      name: 'SIDBI',
      fullName: 'Small Industries Development Bank of India',
      loanType: 'MSME Development Finance',
      potentialLoan: '₹10 Lakh – ₹10 Crore+*',
      purpose: 'Technology, Expansion, Machinery',
      tenure: 'Scheme dependent*'
    }
  ];

  // Government Schemes Data
  const governmentSchemes = [
    {
      name: 'CGTMSE',
      description: 'Credit guarantee support for eligible MSMEs.'
    },
    {
      name: 'PMEGP',
      description: 'Credit-linked subsidy support for eligible new enterprises.'
    },
    {
      name: 'Startup India',
      description: 'Funding and support ecosystem for eligible startups.'
    }
  ];

  // Loan Application Process Steps
  const loanProcessSteps = [
    '1. Eligibility Check',
    '2. Prepare Documents',
    '3. Submit Application',
    '4. Bank Assessment',
    '5. Sanction Decision',
    '6. Disbursement'
  ];

  const handleFindFunding = (e) => {
    e.preventDefault();
    setShowResults(true);
    // Smooth scroll down to results
    setTimeout(() => {
      const el = document.getElementById('fundmatch-results');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const handleOpenProcessModal = (lender) => {
    setSelectedLender(lender);
    setDemoNoticeVisible(false);
  };

  const handleCloseModal = () => {
    setSelectedLender(null);
    setDemoNoticeVisible(false);
  };

  const handleStartApplication = () => {
    setDemoNoticeVisible(true);
  };

  return (
    <section id="fundmatch" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* SECTION HEADER */}
      <div className="bg-gradient-to-r from-blue-900 via-brand-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-10 shadow-soft relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold backdrop-blur-md border border-white/10">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Industry Funding Discovery</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
            <span>💰 UdyamOne FundMatch</span>
          </h2>
          <p className="text-blue-100 text-sm sm:text-base font-normal">
            Find potential funding options for your business
          </p>
        </div>
      </div>

      {/* INPUT FORM */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleFindFunding} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Industry Select */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all cursor-pointer"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              {/* Business Scale Select */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Business Scale
                </label>
                <select
                  value={businessScale}
                  onChange={(e) => setBusinessScale(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all cursor-pointer"
                >
                  {businessScales.map((scale) => (
                    <option key={scale} value={scale}>{scale}</option>
                  ))}
                </select>
              </div>

              {/* Project Cost Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Project Cost
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                  <input
                    type="text"
                    value={projectCost}
                    onChange={(e) => setProjectCost(e.target.value)}
                    placeholder="Enter project cost"
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Funding Required Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Funding Required
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                  <input
                    type="text"
                    value={fundingRequired}
                    onChange={(e) => setFundingRequired(e.target.value)}
                    placeholder="Enter funding required"
                    required
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-700 to-blue-700 hover:from-brand-800 hover:to-blue-800 text-white font-black text-sm shadow-md shadow-brand-700/20 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <span>🔍 Find Funding</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RESULTS SECTION */}
      {showResults && (
        <div id="fundmatch-results" className="space-y-8 animate-fadeIn scroll-mt-20">
          
          {/* User Parameters Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>🎯 Potential Funding Options</span>
                </h3>
              </div>
            </div>

            {/* Entered Parameters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Industry</div>
                <div className="text-sm font-black text-slate-900 mt-1">{industry}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Business Scale</div>
                <div className="text-sm font-black text-slate-900 mt-1">{businessScale}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Project Cost</div>
                <div className="text-sm font-black text-brand-800 mt-1">₹{projectCost}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Funding Required</div>
                <div className="text-sm font-black text-emerald-700 mt-1">₹{fundingRequired}</div>
              </div>
            </div>
          </div>

          {/* LENDER CARDS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {lenders.map((lender) => (
              <div 
                key={lender.id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between space-y-6 relative overflow-hidden group"
              >
                <div className="space-y-4">
                  
                  {/* Top Badge & Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl" role="img" aria-label="medal">{lender.rank}</span>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 group-hover:text-brand-700 transition-colors">
                          {lender.name}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Loan Spec Details */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Loan Type:</span>
                      <strong className="text-slate-900 font-bold">{lender.loanType}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Potential Loan:</span>
                      <strong className="text-emerald-700 font-extrabold">{lender.potentialLoan}</strong>
                    </div>
                    <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500 shrink-0">Purpose:</span>
                      <span className="text-slate-800 font-semibold text-right">{lender.purpose}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Tenure:</span>
                      <span className="text-slate-800 font-semibold">{lender.tenure}</span>
                    </div>
                  </div>

                </div>

                {/* Card CTA */}
                <div>
                  <button
                    onClick={() => handleOpenProcessModal(lender)}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-brand-50 text-brand-700 hover:text-brand-800 font-bold text-xs border border-brand-200 transition-all flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer group-hover:border-brand-400"
                  >
                    <span>View Loan Process</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* GOVERNMENT SCHEMES SECTION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">🇮🇳</span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Government Schemes You May Explore
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {governmentSchemes.map((scheme) => (
                <div
                  key={scheme.name}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="inline-block text-sm font-black uppercase tracking-wider text-brand-800">
                      {scheme.name}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      "{scheme.description}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DISCLAIMER / NOTICE */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-3 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>⚠️ Prototype Notice: </strong>
              "Funding information shown is indicative for demonstration only. Actual loan eligibility, loan amount, interest rate, collateral requirements and approval are determined by the respective financial institution."
            </div>
          </div>

        </div>
      )}

      {/* LOAN PROCESS MODAL */}
      {selectedLender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">🏦</span>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Loan Application Process
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedLender.name} — {selectedLender.loanType}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step-by-Step Flow */}
            <div className="space-y-2.5">
              {loanProcessSteps.map((stepText, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>{stepText}</span>
                  </div>
                  {idx < loanProcessSteps.length - 1 && (
                    <div className="text-slate-400 text-xs py-0.5 font-bold">
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Requested Funding Callout */}
            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-center space-y-1">
              <div className="text-xs text-slate-600 font-medium">Your requested funding:</div>
              <div className="text-xl font-black text-brand-900">
                ₹{fundingRequired}
              </div>
            </div>

            {/* Demo Notice Alert when "Start Application" clicked */}
            {demoNoticeVisible && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1 animate-fadeIn">
                <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Notice</span>
                </div>
                <p className="leading-relaxed text-xs text-amber-900">
                  Demo only — future version will connect to the lender's official application process.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleStartApplication}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-700 to-blue-700 hover:from-brand-800 hover:to-blue-800 text-white font-bold text-xs shadow-md shadow-brand-700/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
              >
                <span>Start Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
export default FundingFinder;
