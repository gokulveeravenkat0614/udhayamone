import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle, 
  ShieldAlert, 
  ExternalLink, 
  Calendar, 
  Info,
  X,
  Compass,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  getStateBoundary, 
  projectGeoPoint, 
  buildSvgPolygonPath 
} from '../data/stateBoundariesGeoJson';
import { 
  POLLUTION_CATEGORIES, 
  formatVerificationDate 
} from '../services/industryAreaHelper';

const SVG_WIDTH = 460;
const SVG_HEIGHT = 350;
const SVG_PADDING = 24;

export const MiniStateMap = ({
  stateName = 'Maharashtra',
  areas = [],
  selectedCategory = 'ALL',
  onSelectCategory,
  onSelectArea,
  selectedAreaId = null,
  compact = true
}) => {
  // Pan and zoom states
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Active pin / popup state
  const [activePin, setActivePin] = useState(null);
  const [hoveredPin, setHoveredPin] = useState(null);

  const mapSvgRef = useRef(null);

  // Retrieve official geographic boundary for the selected state
  const stateBoundary = useMemo(() => {
    return getStateBoundary(stateName);
  }, [stateName]);

  // Reset zoom, pan, and active pin whenever state changes (strictly clear previous pins)
  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActivePin(null);
    setHoveredPin(null);
  }, [stateName]);

  // Sync selectedAreaId from outside (e.g. card click)
  useEffect(() => {
    if (selectedAreaId) {
      const match = areas.find(a => String(a._id) === String(selectedAreaId));
      if (match) setActivePin(match);
    }
  }, [selectedAreaId, areas]);

  // Filter verified areas that have valid geographic coordinates
  // STRICT COMPLIANCE: Never plot fake coordinates.
  const validPins = useMemo(() => {
    return areas.filter(a => {
      const lat = typeof a.latitude === 'number' ? a.latitude : (a.coordinates && a.coordinates.lat);
      const lng = typeof a.longitude === 'number' ? a.longitude : (a.coordinates && a.coordinates.lng);
      return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
    }).map(a => {
      const lat = typeof a.latitude === 'number' ? a.latitude : a.coordinates.lat;
      const lng = typeof a.longitude === 'number' ? a.longitude : a.coordinates.lng;
      const pt = projectGeoPoint(lat, lng, stateBoundary.bounds, SVG_WIDTH, SVG_HEIGHT, SVG_PADDING);
      return {
        ...a,
        geoLat: lat,
        geoLng: lng,
        svgX: pt.x,
        svgY: pt.y
      };
    });
  }, [areas, stateBoundary]);

  // Calculate unmapped count
  const unmappedCount = areas.length - validPins.length;

  // Build SVG polygon boundary path
  const boundaryPath = useMemo(() => {
    return buildSvgPolygonPath(
      stateBoundary.polygon, 
      stateBoundary.bounds, 
      SVG_WIDTH, 
      SVG_HEIGHT, 
      SVG_PADDING
    );
  }, [stateBoundary]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(3.5, prev + 0.35));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.8, prev - 0.35));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan / Drag handlers
  const handleMouseDown = (e) => {
    // Only drag with left click and not on interactive buttons
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Pin category color helper
  const getPinColor = (cat) => {
    switch (cat) {
      case 'RED': return '#e11d48';    // 🔴 Red
      case 'ORANGE': return '#f59e0b'; // 🟠 Orange
      case 'GREEN': return '#10b981';  // 🟢 Green
      case 'WHITE': return '#64748b';  // ⚪ White / Slate
      default: return '#3b82f6';
    }
  };

  const handlePinClick = (pin, e) => {
    e.stopPropagation();
    setActivePin(pin);
    if (onSelectArea) {
      onSelectArea(pin);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Allowed':
        return {
          icon: ShieldCheck,
          style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          label: 'Allowed'
        };
      case 'Conditional':
        return {
          icon: AlertCircle,
          style: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          label: 'Conditional'
        };
      case 'Restricted':
        return {
          icon: ShieldAlert,
          style: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          label: 'Restricted'
        };
      default:
        return {
          icon: AlertCircle,
          style: 'bg-slate-700/50 text-slate-300 border-slate-600',
          label: status || 'Verify with SPCB'
        };
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col relative select-none">
      
      {/* 1. Header Bar: Selected State, Verification Pill & Layer Filters */}
      <div className="p-3.5 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-brand-900/80 border border-brand-700/60 flex items-center justify-center text-brand-300">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="text-sm font-black text-white tracking-wide">
                  {stateName} State Map
                </h4>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  {validPins.length} Pins
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official state boundary with verified SPCB industrial clusters
              </p>
            </div>
          </div>

          {/* Map Controls */}
          <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shrink-0">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom In"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              title="Reset / Fit to State"
              aria-label="Reset / Fit to State"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Synchronized with Map) */}
        <div className="flex flex-wrap items-center gap-1 text-[11px] pt-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>Layer:</span>
          </span>
          {['ALL', 'RED', 'ORANGE', 'GREEN', 'WHITE'].map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory?.(cat)}
                className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer text-[11px] ${
                  isActive 
                    ? cat === 'RED' ? 'bg-rose-600 text-white shadow-xs'
                      : cat === 'ORANGE' ? 'bg-amber-600 text-white shadow-xs'
                      : cat === 'GREEN' ? 'bg-emerald-600 text-white shadow-xs'
                      : cat === 'WHITE' ? 'bg-slate-200 text-slate-950 shadow-xs'
                      : 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive SVG Map Viewport */}
      <div 
        className="relative bg-slate-950 h-[340px] sm:h-[370px] overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Geographic Background Grid */}
        <svg
          ref={mapSvgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full"
        >
          <defs>
            <pattern id="stateMapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
            </pattern>
            {/* Glow filters for pins */}
            <filter id="pinGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Pattern */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#stateMapGrid)" />

          {/* Pan & Zoom Transform Group */}
          <g transform={`translate(${SVG_WIDTH/2 + pan.x}, ${SVG_HEIGHT/2 + pan.y}) scale(${zoom}) translate(${-SVG_WIDTH/2}, ${-SVG_HEIGHT/2})`}>
            
            {/* Real Published Geographic Boundary of Selected State */}
            {boundaryPath && (
              <g className="state-boundary-group">
                {/* State outline drop shadow / glow */}
                <path
                  d={boundaryPath}
                  fill="#091322"
                  stroke="#1e3a8a"
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />
                {/* State geographic polygon interior */}
                <path
                  d={boundaryPath}
                  fill="#0b172a"
                  stroke="#3b82f6"
                  strokeWidth="1.2"
                  strokeDasharray="none"
                  opacity="0.85"
                />
              </g>
            )}

            {/* State Capital Reference Label */}
            {stateBoundary.capital && (
              <text
                x={SVG_WIDTH / 2}
                y={SVG_HEIGHT - 12}
                textAnchor="middle"
                fontSize="9"
                fill="#475569"
                fontWeight="600"
                className="pointer-events-none uppercase tracking-wider"
              >
                {stateBoundary.name} Geographic Territory
              </text>
            )}

            {/* Verified Industrial Area Pins */}
            {validPins.map((pin) => {
              const isSelected = activePin && String(activePin._id) === String(pin._id);
              const isHovered = hoveredPin && String(hoveredPin._id) === String(pin._id);
              const color = getPinColor(pin.category);

              return (
                <g
                  key={pin._id}
                  onClick={(e) => handlePinClick(pin, e)}
                  onMouseEnter={() => setHoveredPin(pin)}
                  onMouseLeave={() => setHoveredPin(null)}
                  className="cursor-pointer group"
                  transform={`translate(${pin.svgX}, ${pin.svgY})`}
                >
                  {/* Selected / Hover Ring Animation */}
                  {isSelected && (
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill={color}
                      opacity="0.3"
                      className="animate-ping"
                    />
                  )}

                  {/* Outer glow ring */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? 10 : isHovered ? 8.5 : 7}
                    fill={color}
                    opacity={isSelected ? 0.95 : 0.8}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter="url(#pinGlow)"
                    className="transition-all duration-200"
                  />

                  {/* Inner white core */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? 3.5 : 2.5}
                    fill="#ffffff"
                  />

                  {/* Pin label (compact) */}
                  <text
                    x="0"
                    y={-11}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={isSelected ? "10" : "8.5"}
                    fontWeight={isSelected ? "bold" : "600"}
                    className="pointer-events-none drop-shadow-md select-none"
                  >
                    {pin.industrialArea.split(' ')[0]}
                  </text>
                </g>
              );
            })}

          </g>
        </svg>

        {/* Empty state overlay when state has no verified coordinates */}
        {validPins.length === 0 && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-200 max-w-xs">
              No verified industrial-area locations available for this selection.
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Consult the official State Pollution Control Board siting portal for unmapped zones.
            </p>
          </div>
        )}

        {/* North Indicator */}
        <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 text-center text-[9px] text-slate-400 font-mono pointer-events-none">
          <div className="font-bold text-slate-200">▲ N</div>
          <div className="text-[7px] text-slate-500">W ┼ E</div>
          <div className="text-slate-400">▼ S</div>
        </div>

        {/* Banner for unmapped coordinates */}
        {unmappedCount > 0 && (
          <div className="absolute bottom-2 left-2 right-2 text-[10px] text-amber-300 bg-slate-900/95 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shadow-md">
            <Info className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">
              {unmappedCount} location{unmappedCount > 1 ? 's' : ''} coordinates unavailable (listed below)
            </span>
          </div>
        )}

      </div>

      {/* 3. Interactive Pin Popup / Details Card (when a pin is clicked) */}
      {activePin && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3 transition-all animate-fadeIn">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black border uppercase ${
                  POLLUTION_CATEGORIES[activePin.category]?.color || 'bg-slate-800 text-slate-300'
                }`}>
                  {POLLUTION_CATEGORIES[activePin.category]?.badge || activePin.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-brand-400" />
                  <span>
                    {(activePin.geoLat || activePin.coordinates?.lat)?.toFixed(3)}°N, {(activePin.geoLng || activePin.coordinates?.lng)?.toFixed(3)}°E
                  </span>
                </span>
              </div>

              <h5 className="text-sm font-black text-white mt-1 leading-snug">
                {activePin.industrialArea}
              </h5>
              <p className="text-xs text-brand-400 font-medium">
                {activePin.district}, {activePin.state}
              </p>
            </div>

            <button
              onClick={() => setActivePin(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Siting Status & Authority */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Siting Status</span>
              {(() => {
                const s = getStatusBadge(activePin.eligibilityStatus);
                const Icon = s.icon;
                return (
                  <span className={`inline-flex items-center space-x-1 font-bold mt-0.5 ${s.style} px-2 py-0.5 rounded text-[10px] border`}>
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>{s.label}</span>
                  </span>
                );
              })()}
            </div>

            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[9px] uppercase font-bold text-slate-500 block">Authority</span>
              <span className="font-bold text-slate-300 text-[11px] truncate block mt-0.5" title={activePin.authority}>
                {activePin.authority}
              </span>
            </div>
          </div>

          {/* Statutory Conditions */}
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Verified Siting Conditions
            </span>
            <p className="text-xs text-slate-300 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 leading-relaxed font-normal">
              {activePin.conditions}
            </p>
          </div>

          {/* Official Source & Verification Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] border-t border-slate-800/80">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Verified: <strong className="text-slate-300">{formatVerificationDate(activePin.lastVerifiedAt)}</strong></span>
            </div>

            {activePin.sourceUrl && (
              <a
                href={activePin.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-brand-400 hover:text-brand-300 font-bold transition-colors"
              >
                <span>Official Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 4. Mandatory Regulatory Disclaimer & Category Legend */}
      <div className="p-3 bg-slate-900/95 border-t border-slate-800 space-y-2">
        {/* Clean Legend */}
        <div className="flex items-center justify-center gap-3 text-[10px] text-slate-300 font-medium">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            <span>Red</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span>Orange</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Green</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
            <span>White</span>
          </span>
        </div>

        {/* Mandatory Regulatory Disclaimer */}
        <div className="text-[10px] text-slate-400 text-center leading-normal border-t border-slate-800/60 pt-2 space-y-0.5">
          <p className="font-semibold text-slate-400">
            Assistance & Discovery Tool (Not a government portal)
          </p>
          <p className="text-slate-500 text-[9px] leading-tight">
            Map locations are provided for guidance based on available verified information. Final site suitability and approval depend on applicable PCB, zoning, environmental and local authority requirements.
          </p>
        </div>
      </div>

    </div>
  );
};
