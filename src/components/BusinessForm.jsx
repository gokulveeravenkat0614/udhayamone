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
  Info
} from 'lucide-react';
import { STATES_AND_DISTRICTS, POPULAR_PRESETS } from '../data/locations';
import { INDUSTRIES } from '../data/industries';

export const BusinessForm = ({ 
  selectedState, 
  setSelectedState, 
  selectedDistrict, 
  setSelectedDistrict, 
  selectedIndustry, 
  setSelectedIndustry, 
  onSubmit 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    setSelectedIndustry(e.target.value);
    setErrorMessage('');
  };

  const handlePresetSelect = (preset) => {
    setSelectedState(preset.state);
    setSelectedDistrict(preset.district);
    setSelectedIndustry(preset.industry);
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedState) {
      setErrorMessage('Please select a State.');
      return;
    }
    if (!selectedDistrict) {
      setErrorMessage('Please select a District.');
      return;
    }
    if (!selectedIndustry) {
      setErrorMessage('Please select an Industry Type.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    // Provide a crisp professional loading transition
    setTimeout(() => {
      setIsLoading(false);
      onSubmit();
    }, 450);
  };

  const currentIndustryMeta = INDUSTRIES.find(i => i.id === selectedIndustry) || INDUSTRIES[0];

  return (
    <div id="requirements-wizard" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 sm:-mt-10 relative z-20">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200 overflow-hidden">
        
        {/* Form Card Header */}
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-india-navy text-white px-6 py-6 sm:px-10 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-white/10 text-blue-200 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Single-Window Discovery Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Find Your Industry Requirements
              </h2>
              <p className="text-blue-100 text-sm sm:text-base mt-1.5 max-w-2xl font-normal">
                Tell us about your proposed business and we'll identify the applicable approvals and documents.
              </p>
            </div>

            {/* Quick Helper Badge */}
            <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 hidden md:block text-right">
              <div className="text-xs text-blue-200 font-medium">Clearance Pipeline</div>
              <div className="text-lg font-black text-amber-300">3 Simple Steps</div>
              <div className="text-[11px] text-blue-200/80">State → District → Sector</div>
            </div>
          </div>

          {/* Preset Quick Chips */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-blue-200 font-medium flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1 text-amber-400" /> Fast Presets:
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* STEP 1: Select State */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-bold text-slate-900">
                <span className="flex items-center space-x-1.5">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <span>Select State</span>
                </span>
                <span className="text-xs text-brand-600 font-semibold">Required</span>
              </label>

              <div className="relative">
                <select
                  value={selectedState}
                  onChange={handleStateChange}
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-brand-600 rounded-xl text-slate-900 font-medium text-sm transition-all outline-hidden appearance-none cursor-pointer shadow-xs focus:ring-4 focus:ring-brand-500/10"
                >
                  <option value="" disabled>-- Choose State --</option>
                  {Object.keys(STATES_AND_DISTRICTS).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                {selectedState === "Maharashtra" ? "High detail available: 20+ Maharashtra districts" : "Pan-India industrial single window"}
              </p>
            </div>

            {/* STEP 2: Select District */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-bold text-slate-900">
                <span className="flex items-center space-x-1.5">
                  <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <span>Select District</span>
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
                  <option value="" disabled>-- Select District --</option>
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
                  <span>Select Industry Type</span>
                </span>
                <span className="text-xs text-brand-600 font-semibold">Classification</span>
              </label>

              <div className="relative">
                <select
                  value={selectedIndustry}
                  onChange={handleIndustryChange}
                  className="w-full pl-10 pr-10 py-3.5 bg-slate-50 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-brand-600 rounded-xl text-slate-900 font-medium text-sm transition-all outline-hidden appearance-none cursor-pointer shadow-xs focus:ring-4 focus:ring-brand-500/10"
                >
                  <option value="" disabled>-- Select Industry --</option>
                  {INDUSTRIES.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
                <Factory className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Pollution Category: <span className="font-semibold text-slate-700">{currentIndustryMeta.pollutionCategory}</span>
              </p>
            </div>

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
              <span>Instant evaluation • No login required to view approvals</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-700 via-brand-800 to-blue-700 hover:from-brand-800 hover:to-blue-800 text-white font-bold text-base rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all flex items-center justify-center space-x-3 active:scale-98 disabled:opacity-75 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Personalized Matrix...</span>
                </>
              ) : (
                <>
                  <span>Find Required Approvals</span>
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
