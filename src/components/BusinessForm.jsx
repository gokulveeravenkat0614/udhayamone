import React, { useState } from 'react';
import { 
  MapPin, 
  Building, 
  Factory, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  Info,
  Sliders,
  Users,
  Zap,
  Maximize2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Briefcase
} from 'lucide-react';
import { STATES_AND_DISTRICTS, POPULAR_PRESETS } from '../data/locations';
import { INDUSTRIES } from '../data/industries';
import { calculateMSMEClassification, calculatePollutionCategory } from '../services/ruleEngine';
import { useTranslation } from '../i18n/LanguageContext';

export const BusinessForm = ({ 
  selectedState, 
  setSelectedState, 
  selectedDistrict, 
  setSelectedDistrict, 
  selectedIndustry, 
  setSelectedIndustry,
  businessProfile = {
    entityType: 'Private Limited Company',
    investment: 2.5,
    turnover: 12.0,
    employeeCount: 25,
    powerRequired: 75,
    builtUpArea: 1500,
    usesHazardousChemicals: false,
    isExportOriented: false
  },
  setBusinessProfile,
  onSubmit 
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Local profile fallback if setBusinessProfile is not provided
  const [localProfile, setLocalProfile] = useState(businessProfile);
  const activeProfile = businessProfile || localProfile;
  const updateProfile = (field, val) => {
    const updated = { ...activeProfile, [field]: val };
    if (setBusinessProfile) {
      setBusinessProfile(updated);
    } else {
      setLocalProfile(updated);
    }
  };

  // Derive available districts directly from selected state
  const districtsList = (selectedState && STATES_AND_DISTRICTS[selectedState]) || [];

  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setErrorMessage('');

    const newDistricts = STATES_AND_DISTRICTS[newState] || [];
    if (!newDistricts.includes(selectedDistrict)) {
      if (newState === "Maharashtra") {
        setSelectedDistrict("Pune");
      } else if (newState === "Telangana") {
        setSelectedDistrict("Hyderabad");
      } else {
        setSelectedDistrict(newDistricts[0] || "");
      }
    }
  };

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setErrorMessage('');
  };

  const handleIndustryChange = (e) => {
    const newIndustry = e.target.value;
    setSelectedIndustry(newIndustry);
    setErrorMessage('');

    // Apply smart defaults based on selected sector
    if (newIndustry === 'Information Technology') {
      updateProfile('employeeCount', 15);
      updateProfile('powerRequired', 15);
      updateProfile('builtUpArea', 400);
      updateProfile('usesHazardousChemicals', false);
      updateProfile('investment', 0.8);
      updateProfile('turnover', 5.0);
    } else if (newIndustry === 'Chemical Industry') {
      updateProfile('usesHazardousChemicals', true);
      updateProfile('employeeCount', 30);
      updateProfile('powerRequired', 100);
      updateProfile('builtUpArea', 2500);
      updateProfile('investment', 6.0);
      updateProfile('turnover', 25.0);
    } else if (newIndustry === 'Food Processing') {
      updateProfile('usesHazardousChemicals', false);
      updateProfile('employeeCount', 20);
      updateProfile('powerRequired', 45);
      updateProfile('builtUpArea', 1200);
      updateProfile('investment', 2.0);
      updateProfile('turnover', 8.0);
    }
  };

  const handlePresetSelect = (preset) => {
    setSelectedState(preset.state);
    setSelectedDistrict(preset.district);
    setSelectedIndustry(preset.industry);
    setErrorMessage('');

    if (preset.industry === 'Information Technology') {
      updateProfile('employeeCount', 15);
      updateProfile('powerRequired', 15);
      updateProfile('builtUpArea', 400);
      updateProfile('usesHazardousChemicals', false);
    } else if (preset.industry === 'Chemical Industry') {
      updateProfile('usesHazardousChemicals', true);
      updateProfile('employeeCount', 30);
      updateProfile('powerRequired', 100);
    } else {
      updateProfile('employeeCount', 25);
      updateProfile('powerRequired', 75);
      updateProfile('builtUpArea', 1500);
      updateProfile('usesHazardousChemicals', false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedState) {
      setErrorMessage(t('form.errorState', 'Please select a State.'));
      return;
    }
    if (!selectedDistrict) {
      setErrorMessage(t('form.errorDistrict', 'Please select a District.'));
      return;
    }
    if (!selectedIndustry) {
      setErrorMessage(t('form.errorIndustry', 'Please select an Industry Type.'));
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSubmit();
    }, 350);
  };

  const currentIndustryMeta = INDUSTRIES.find(i => i.id === selectedIndustry) || INDUSTRIES[0];
  const msmePreview = calculateMSMEClassification(activeProfile.investment, activeProfile.turnover);
  const pollutionPreview = calculatePollutionCategory(selectedIndustry, activeProfile);

  return (
    <div id="requirements-wizard" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 sm:-mt-10 relative z-20">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200 overflow-hidden">
        
        {/* Form Card Header */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-india-navy text-white px-6 py-6 sm:px-10 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white/10 text-blue-200 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('form.singleWindowBadge', 'Single-Window Discovery & Conditional Rules Engine')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {t('form.title', 'Find Your Applicable Approvals & Dependencies')}
              </h2>
              <p className="text-blue-100 text-sm sm:text-base mt-1.5 max-w-2xl font-normal">
                {t('form.subtitle', 'Submit your proposed location, industry, and business profile to generate applicable clearances, statutory exemptions, and recommended sequence.')}
              </p>
            </div>

            {/* Quick Helper Badge */}
            <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 hidden md:block text-right">
              <div className="text-xs text-blue-200 font-medium">{t('form.pipelineTitle', 'Clearance Pipeline')}</div>
              <div className="text-lg font-black text-amber-300">{t('form.pipelineStages', '4 Intelligent Stages')}</div>
              <div className="text-[11px] text-blue-200/80">{t('form.pipelineDesc', 'Location → Sector → Rules → Sequence')}</div>
            </div>
          </div>

          {/* Preset Quick Chips */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-blue-200 font-medium flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1 text-amber-400" /> {t('form.fastPresets', 'Fast Presets:')}
            </span>
            {POPULAR_PRESETS.map((preset, idx) => {
              const isSelected = selectedState === preset.state && selectedDistrict === preset.district && selectedIndustry === preset.industry;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected 
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md' 
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  }`}
                >
                  {preset.district}, {preset.state} • {preset.industry}
                  {preset.tag === "Primary Demo Scenario" && (
                    <span className="ml-1.5 px-1 py-0.2 bg-emerald-500 text-white rounded text-[10px] uppercase font-extrabold">Demo</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
          
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CORE SELECTIONS: 3 Main Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* STEP 1: Select State */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-bold text-slate-900">
                <span className="flex items-center space-x-1.5">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <span>{t('form.step1', 'Select State')}</span>
                </span>
                <span className="text-xs text-brand-600 font-semibold">{t('common.required', 'Required')}</span>
              </label>

              <div className="relative">
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-brand-600 rounded-xl text-slate-900 font-medium text-sm transition-all outline-hidden appearance-none cursor-pointer shadow-xs focus:ring-4 focus:ring-brand-500/10"
                >
                  <option value="" disabled>{t('form.chooseState', '-- Choose State --')}</option>
                  {Object.keys(STATES_AND_DISTRICTS).map((st) => (
                    <option key={st} value={st}>
                      {t('states.' + st, st)}
                    </option>
                  ))}
                </select>
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {selectedState === "Telangana" ? "TS-iPASS integrated: All 33 Telangana industrial districts" : selectedState === "Maharashtra" ? "High detail available: 20+ Maharashtra districts" : "Pan-India industrial single window"}
              </p>
            </div>

            {/* STEP 2: Select District */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-bold text-slate-900">
                <span className="flex items-center space-x-1.5">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <span>{t('form.step2', 'Select District')}</span>
                </span>
                <span className="text-xs text-brand-600 font-semibold">Dynamic</span>
              </label>

              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  disabled={!selectedState || districtsList.length === 0}
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-brand-600 rounded-xl text-slate-900 font-medium text-sm transition-all outline-hidden appearance-none cursor-pointer shadow-xs focus:ring-4 focus:ring-brand-500/10 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>{t('form.chooseDistrict', '-- Select District --')}</option>
                  {districtsList.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
                <Building className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Districts adapt automatically to {selectedState || 'State'}
              </p>
            </div>

            {/* STEP 3: Select Industry Type */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-bold text-slate-900">
                <span className="flex items-center space-x-1.5">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  <span>{t('form.step3', 'Select Industry Type')}</span>
                </span>
                <span className="text-xs text-brand-600 font-semibold">Classification</span>
              </label>

              <div className="relative">
                <select
                  value={selectedIndustry}
                  onChange={handleIndustryChange}
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-brand-600 rounded-xl text-slate-900 font-medium text-sm transition-all outline-hidden appearance-none cursor-pointer shadow-xs focus:ring-4 focus:ring-brand-500/10"
                >
                  <option value="" disabled>{t('form.chooseIndustry', '-- Select Industry --')}</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {t('industries.' + ind.id, ind.name)}
                    </option>
                  ))}
                </select>
                <Factory className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Pollution Category: <span className="font-semibold text-slate-700">{pollutionPreview.category}</span>
              </p>
            </div>

          </div>

          {/* Collapsible / Interactive Business Details & Conditional Parameters */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-brand-700" />
                <span className="text-xs font-bold text-slate-900">
                  {t('form.advancedProfile', 'Business Profile & Operational Parameters (Conditional Rules)')}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-brand-800 text-[10px] font-extrabold">
                  Smart Defaults
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center space-x-1 cursor-pointer"
              >
                <span>{showAdvanced ? t('form.hideAdvanced', 'Hide Parameter Adjustments') : t('form.showAdvanced', 'Customize Profile Parameters')}</span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Statutory Previews Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">MSME Status</span>
                <span className="font-bold text-slate-900">{msmePreview.label}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">Labour Regulation</span>
                <span className="font-bold text-slate-900">
                  {activeProfile.employeeCount >= 10 && selectedIndustry !== 'Information Technology' ? 'Factories Act (10+)' : 'Shops & Est. Act'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">Power Classification</span>
                <span className="font-bold text-slate-900">
                  {activeProfile.powerRequired > 50 ? 'High Tension (HT)' : 'Low Tension (LT)'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block">Fire NOC Norm</span>
                <span className="font-bold text-slate-900">
                  {activeProfile.builtUpArea >= 500 && selectedIndustry !== 'Information Technology' ? 'Mandatory NOC (>=500m²)' : 'Basic Compliance'}
                </span>
              </div>
            </div>

            {/* Expandable Inputs Grid */}
            {showAdvanced && (
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs animate-fadeIn">
                
                {/* Legal Entity */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center space-x-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span>Entity Structure</span>
                  </label>
                  <select
                    value={activeProfile.entityType}
                    onChange={(e) => updateProfile('entityType', e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 outline-hidden"
                  >
                    <option value="Private Limited Company">Private Limited Company</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="Public Limited Company">Public Limited Company</option>
                  </select>
                </div>

                {/* Investment */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">
                    Plant & Machinery Investment (₹ Cr)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={activeProfile.investment}
                    onChange={(e) => updateProfile('investment', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500">MSME threshold: Micro ≤ 1, Small ≤ 10, Medium ≤ 50 Cr</span>
                </div>

                {/* Annual Turnover */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800">
                    Expected Annual Turnover (₹ Cr)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={activeProfile.turnover}
                    onChange={(e) => updateProfile('turnover', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500">GST mandatory if turnover ≥ ₹0.40 Cr</span>
                </div>

                {/* Workers / Employees */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Workforce (Employees / Workers)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={activeProfile.employeeCount}
                    onChange={(e) => updateProfile('employeeCount', parseInt(e.target.value, 10) || 1)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500">Factories Act triggers at 10+ with power; EPFO at 20+</span>
                </div>

                {/* Power Load */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-slate-500" />
                    <span>Connected Electrical Load (HP)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={activeProfile.powerRequired}
                    onChange={(e) => updateProfile('powerRequired', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500">Loads &gt; 50 HP trigger HT substation clearance</span>
                </div>

                {/* Built-up Area */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center space-x-1">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Built-up / Shed Area (sq.m)</span>
                  </label>
                  <input
                    type="number"
                    min="50"
                    value={activeProfile.builtUpArea}
                    onChange={(e) => updateProfile('builtUpArea', parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-900 outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500">NBC Fire NOC required if area ≥ 500 sq.m</span>
                </div>

                {/* Checkboxes: Hazardous & Export */}
                <div className="sm:col-span-2 lg:col-span-3 pt-2 flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={activeProfile.usesHazardousChemicals}
                      onChange={(e) => updateProfile('usesHazardousChemicals', e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Stores / handles flammable petroleum solvents, compressed gases, or toxic chemicals (PESO rule)
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer bg-white p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={activeProfile.isExportOriented}
                      onChange={(e) => updateProfile('isExportOriented', e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      100% Export Oriented Unit (EOU) / International Export
                    </span>
                  </label>
                </div>

              </div>
            )}
          </div>

          {/* Selected Industry Context Preview Banner */}
          {selectedIndustry && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900">{currentIndustryMeta.name}:</span>{' '}
                  <span>{currentIndustryMeta.description}</span>
                </div>
              </div>
              <div className="shrink-0 flex items-center space-x-2">
                <span className="font-medium text-slate-500">Key Clearances:</span>
                <span className="px-2 py-0.5 rounded bg-white text-brand-900 font-semibold border border-blue-200">
                  {currentIndustryMeta.sampleKey}
                </span>
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant evaluation • Statutory rules & dependency engine applied</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-700 via-brand-800 to-blue-700 hover:from-brand-800 hover:to-blue-800 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all flex items-center justify-center space-x-3 active:scale-98 disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('form.evaluating', 'Evaluating Statutory Rules & Graph...')}</span>
                </>
              ) : (
                <>
                  <span>{t('form.findApprovalsBtn', 'Find Required Approvals & Sequence')}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
