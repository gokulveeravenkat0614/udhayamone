import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink, 
  Calendar, 
  HelpCircle,
  Compass,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { STATES_AND_DISTRICTS } from '../data/locations';
import { INDUSTRIES } from '../data/industries';
import { industryAreaApi } from '../services/api';
import { 
  POLLUTION_CATEGORIES, 
  detectIndustryPollutionCategory, 
  formatVerificationDate, 
  isRecordOutdated 
} from '../services/industryAreaHelper';
import { IndustryAreaMap } from './IndustryAreaMap';

export const IndustryAreaEligibility = ({
  initialState = 'Maharashtra',
  initialDistrict = 'All',
  initialCategory = 'ALL',
  onNavigate
}) => {
  // Master state selection reusing STATES_AND_DISTRICTS
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory); // 'ALL', 'RED', 'ORANGE', 'GREEN', 'WHITE'
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [industrySearchQuery, setIndustrySearchQuery] = useState('');
  
  // Data state
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'map'
  const [selectedAreaId, setSelectedAreaId] = useState(null);

  // Available districts for chosen state (strictly reusing website data)
  const availableDistricts = useMemo(() => {
    return STATES_AND_DISTRICTS[selectedState] || [];
  }, [selectedState]);

  // Detected pollution category when user searches / picks an industry
  const detectedCategory = useMemo(() => {
    const input = selectedIndustry || industrySearchQuery;
    return detectIndustryPollutionCategory(input);
  }, [selectedIndustry, industrySearchQuery]);

  // Fetch areas from backend API based on state and filters
  const loadAreas = useCallback(async () => {
    if (!selectedState) return;

    try {
      setLoading(true);
      setError(null);
      const res = await industryAreaApi.getAreas({
        state: selectedState,
        district: selectedDistrict !== 'All' && selectedDistrict !== 'All Districts' ? selectedDistrict : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
        industry: selectedIndustry || undefined
      });

      if (res && res.success && Array.isArray(res.areas)) {
        setAreas(res.areas);
      } else if (Array.isArray(res)) {
        setAreas(res);
      } else {
        setAreas([]);
      }
    } catch (err) {
      console.error('Failed to load industry areas:', err);
      setError('Unable to load industry-area information. Please try again.');
      setAreas([]);
    } finally {
      setLoading(false);
    }
  }, [selectedState, selectedDistrict, selectedCategory, selectedIndustry]);

  // Load when state or filters change
  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  // Reset district when state changes
  const handleStateChange = (newState) => {
    setSelectedState(newState);
    setSelectedDistrict('All');
  };

  // Quick apply detected industry category filter
  const handleApplyDetectedCategory = (cat) => {
    if (cat) {
      setSelectedCategory(cat);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Allowed':
        return {
          icon: ShieldCheck,
          style: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          label: 'Allowed'
        };
      case 'Conditional':
        return {
          icon: AlertCircle,
          style: 'bg-amber-50 text-amber-800 border-amber-300',
          label: 'Conditional (CETP / ZLD Required)'
        };
      case 'Restricted':
        return {
          icon: ShieldAlert,
          style: 'bg-rose-50 text-rose-800 border-rose-300',
          label: 'Restricted / Prohibited'
        };
      default:
        return {
          icon: HelpCircle,
          style: 'bg-slate-100 text-slate-700 border-slate-300',
          label: status || 'Verify with SPCB'
        };
    }
  };

  // Stats for the active view
  const redCount = areas.filter(a => a.category === 'RED').length;
  const orangeCount = areas.filter(a => a.category === 'ORANGE').length;
  const greenCount = areas.filter(a => a.category === 'GREEN').length;
  const whiteCount = areas.filter(a => a.category === 'WHITE').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Header Banner & Mandatory Regulatory Disclaimer */}
      <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-800/80 border border-brand-600 text-brand-200 text-xs font-bold mb-3">
              <Compass className="w-3.5 h-3.5 text-brand-300" />
              <span>Assistance & Discovery Tool (Not a government portal)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Industry Area Eligibility
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl leading-relaxed">
              "Where can I establish my industry in this state based on its pollution category?"
              Discover approved industrial estates, SPCB buffer criteria, and statutory siting restrictions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'cards'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Cards View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
                viewMode === 'map'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Spatial Map</span>
            </button>
          </div>
        </div>

        {/* Important Regulatory Disclaimer Callout */}
        <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start space-x-3 text-xs text-slate-300">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-white">Regulatory Disclaimer: </span>
            Industry area eligibility is provided for guidance and discovery. Final approval depends on applicable State Pollution Control Board, local planning authority, environmental, zoning and other statutory requirements. Verify current requirements with the concerned authority before establishing an industry.
          </p>
        </div>
      </div>

      {/* 2. Interactive Siting Discovery Console (Filters & Industry Selector) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* State / UT Selector (Strictly reusing STATES_AND_DISTRICTS) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              1. Select State / UT <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all outline-hidden cursor-pointer"
              >
                {Object.keys(STATES_AND_DISTRICTS).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports all states configured in UdyamOne.
            </p>
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              2. Filter District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all outline-hidden cursor-pointer"
            >
              <option value="All">All Districts ({availableDistricts.length})</option>
              {availableDistricts.map(dist => (
                <option key={dist} value={dist}>{dist}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Limits search to specific industrial corridors.
            </p>
          </div>

          {/* Industry Search / Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
              3. Industry Activity / Type
            </label>
            <div className="relative">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full pl-3.5 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 transition-all outline-hidden cursor-pointer"
              >
                <option value="">All Industry Sectors</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind.id} value={ind.id}>{ind.name}</option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Select your activity to detect CPCB pollution index.
            </p>
          </div>

        </div>

        {/* Detected Industry Category Notification */}
        {detectedCategory && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center space-x-3">
              <span className={`px-2.5 py-1 rounded-xl text-xs font-black border uppercase shrink-0 ${
                POLLUTION_CATEGORIES[detectedCategory.category]?.color || 'bg-slate-200'
              }`}>
                {POLLUTION_CATEGORIES[detectedCategory.category]?.badge || detectedCategory.category}
              </span>
              <div className="text-xs">
                <span className="font-bold text-slate-900">{detectedCategory.name}: </span>
                <span className="text-slate-600">{detectedCategory.rationale}</span>
              </div>
            </div>

            <button
              onClick={() => handleApplyDetectedCategory(detectedCategory.category)}
              className="px-3.5 py-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs transition-colors shrink-0 flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Filter {detectedCategory.category} Areas</span>
            </button>
          </div>
        )}

        {/* Category Filter Tabs with Counts */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            4. SPCB Pollution Category Siting Filters
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`p-3 rounded-2xl font-bold transition-all text-left border cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span className="block text-[10px] text-slate-400 uppercase tracking-wider">All Categories</span>
              <span className="text-base font-black mt-0.5 block">{areas.length} Areas</span>
            </button>

            <button
              onClick={() => setSelectedCategory('RED')}
              className={`p-3 rounded-2xl font-bold transition-all text-left border cursor-pointer ${
                selectedCategory === 'RED'
                  ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                  : 'bg-rose-50/70 text-rose-900 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wider flex items-center space-x-1">
                <span>🔴 RED (PI ≥ 60)</span>
              </span>
              <span className="text-base font-black mt-0.5 block">{redCount} Estates</span>
            </button>

            <button
              onClick={() => setSelectedCategory('ORANGE')}
              className={`p-3 rounded-2xl font-bold transition-all text-left border cursor-pointer ${
                selectedCategory === 'ORANGE'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50/70 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wider flex items-center space-x-1">
                <span>🟠 ORANGE (41-59)</span>
              </span>
              <span className="text-base font-black mt-0.5 block">{orangeCount} Estates</span>
            </button>

            <button
              onClick={() => setSelectedCategory('GREEN')}
              className={`p-3 rounded-2xl font-bold transition-all text-left border cursor-pointer ${
                selectedCategory === 'GREEN'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wider flex items-center space-x-1">
                <span>🟢 GREEN (21-40)</span>
              </span>
              <span className="text-base font-black mt-0.5 block">{greenCount} Estates</span>
            </button>

            <button
              onClick={() => setSelectedCategory('WHITE')}
              className={`p-3 rounded-2xl font-bold transition-all text-left border cursor-pointer ${
                selectedCategory === 'WHITE'
                  ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                  : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wider flex items-center space-x-1">
                <span>⚪ WHITE (Exempt)</span>
              </span>
              <span className="text-base font-black mt-0.5 block">{whiteCount} Estates</span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. Spatial Map Viewport (When viewMode === 'map') */}
      {viewMode === 'map' && (
        <IndustryAreaMap
          areas={areas}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onSelectArea={(area) => setSelectedAreaId(area._id)}
          selectedAreaId={selectedAreaId}
        />
      )}

      {/* 4. Loading State */}
      {loading && (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-soft">
          <RefreshCw className="w-9 h-9 text-brand-600 animate-spin mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900">Loading verified industry areas...</h4>
          <p className="text-xs text-slate-500 mt-1">Retrieving official SPCB siting criteria and zoning records from database</p>
        </div>
      )}

      {/* 5. Error State */}
      {error && !loading && (
        <div className="py-16 text-center bg-rose-50/50 rounded-3xl border border-rose-200 p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">{error}</h4>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Please check your connection and click retry.
          </p>
          <button
            onClick={loadAreas}
            className="px-4 py-2 rounded-xl bg-brand-700 text-white font-bold text-xs hover:bg-brand-800 transition-all inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 6. Empty State: When State has no verified area records in database (Rule 2 Compliance) */}
      {!loading && !error && areas.length === 0 && (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-soft p-8 space-y-4 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Verified area-specific information is currently unavailable for {selectedState}.
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Verified area-specific information is currently unavailable for this state. Please verify with the concerned State Pollution Control Board/local authority.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleStateChange('Maharashtra')}
              className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-xs border border-brand-200 transition-colors cursor-pointer"
            >
              Switch to Maharashtra
            </button>
            <button
              onClick={() => handleStateChange('Tamil Nadu')}
              className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-xs border border-brand-200 transition-colors cursor-pointer"
            >
              Switch to Tamil Nadu
            </button>
            <button
              onClick={() => handleStateChange('Gujarat')}
              className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold text-xs border border-brand-200 transition-colors cursor-pointer"
            >
              Switch to Gujarat
            </button>
          </div>
        </div>
      )}

      {/* 7. RESULT CARDS (Section 5 Standard) */}
      {!loading && !error && areas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
              <span>Verified Eligible Industrial Areas in {selectedState}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {areas.length} Estates
              </span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Official SPCB / IDC records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {areas.map((area) => {
              const categoryConfig = POLLUTION_CATEGORIES[area.category] || POLLUTION_CATEGORIES.ORANGE;
              const statusConfig = getStatusBadge(area.eligibilityStatus);
              const StatusIcon = statusConfig.icon;
              const isOutdated = isRecordOutdated(area.lastVerifiedAt);

              return (
                <div
                  key={area._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-soft hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    
                    {/* Top Row: Location & Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center space-x-1 text-xs font-semibold text-brand-700 mb-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{area.district}, {area.state}</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 leading-snug">
                          {area.industrialArea}
                        </h4>
                      </div>

                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl border uppercase shrink-0 ${categoryConfig.color}`}>
                        {categoryConfig.badge}
                      </span>
                    </div>

                    {/* Siting Eligibility Status Badge */}
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Siting Status:
                      </span>
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${statusConfig.style}`}>
                        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{statusConfig.label}</span>
                      </span>
                    </div>

                    {/* Applicable Industry Types Tagged */}
                    {area.industryType && area.industryType.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                          Applicable:
                        </span>
                        {area.industryType.map((ind, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Statutory Conditions & Buffer Criteria */}
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Statutory Siting Conditions:
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-medium">
                        {area.conditions}
                      </p>
                    </div>

                    {/* Regulatory Authority & Official Source Reference */}
                    <div className="space-y-1 text-xs pt-1">
                      <div className="text-slate-600">
                        <span className="font-bold text-slate-800">Authority: </span>
                        {area.authority}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-bold text-slate-800">Source: </span>
                        <span className="italic">{area.sourceTitle}</span>
                      </div>
                    </div>

                  </div>

                  {/* Card Footer: Last Verified Date, Freshness Tag & Reference Link */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    
                    <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last verified: <strong className="text-slate-700">{formatVerificationDate(area.lastVerifiedAt)}</strong></span>
                      {isOutdated ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[9px]">
                          Verification required
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                          Current
                        </span>
                      )}
                    </div>

                    {area.sourceUrl && (
                      <a
                        href={area.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-brand-700 hover:text-brand-900 font-bold text-xs transition-colors self-start sm:self-auto"
                      >
                        <span>Official Siting Guidelines</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
