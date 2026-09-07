import React, { useState } from 'react';
import { MapPin, ShieldAlert, ShieldCheck, AlertCircle, ExternalLink, Calendar, Compass, Layers } from 'lucide-react';
import { POLLUTION_CATEGORIES, formatVerificationDate } from '../services/industryAreaHelper';

export const IndustryAreaMap = ({
  areas = [],
  selectedCategory = 'ALL',
  onSelectCategory,
  onSelectArea,
  selectedAreaId = null
}) => {
  const [activeMarkerId, setActiveMarkerId] = useState(selectedAreaId);

  // Filter only areas that have valid verified coordinates
  const mappedAreas = areas.filter(
    a => a.coordinates && typeof a.coordinates.lat === 'number' && typeof a.coordinates.lng === 'number'
  );

  const unmappedCount = areas.length - mappedAreas.length;

  const activeMarker = mappedAreas.find(a => String(a._id) === String(activeMarkerId)) || mappedAreas[0];

  // Calculate bounding box for dynamic SVG plotting
  let minLat = 8.0, maxLat = 30.0, minLng = 68.0, maxLng = 88.0;
  if (mappedAreas.length > 0) {
    const lats = mappedAreas.map(a => a.coordinates.lat);
    const lngs = mappedAreas.map(a => a.coordinates.lng);
    minLat = Math.min(...lats) - 1.2;
    maxLat = Math.max(...lats) + 1.2;
    minLng = Math.min(...lngs) - 1.5;
    maxLng = Math.max(...lngs) + 1.5;
  }

  // Normalize lat/lng to SVG viewport [100, 500] width, [50, 350] height
  const getSvgCoords = (lat, lng) => {
    const latSpan = maxLat - minLat || 1;
    const lngSpan = maxLng - minLng || 1;
    const x = 50 + ((lng - minLng) / lngSpan) * 500;
    // Invert Y because SVG y=0 is top
    const y = 350 - ((lat - minLat) / latSpan) * 280;
    return { x, y };
  };

  const getMarkerColor = (cat) => {
    switch (cat) {
      case 'RED': return '#e11d48';
      case 'ORANGE': return '#f59e0b';
      case 'GREEN': return '#10b981';
      case 'WHITE': return '#64748b';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
      
      {/* Map Header Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-brand-900/60 text-brand-300 text-xs font-bold mb-1">
            <Compass className="w-3.5 h-3.5 text-brand-400" />
            <span>Verified Geographic Siting Visualizer</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center space-x-2">
            <span>Spatial Industry Clusters</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {mappedAreas.length} Mapped Areas
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real GPS coordinates mapped strictly from official industrial estate notifications.
          </p>
        </div>

        {/* Category Filters inside Map */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center space-x-1">
            <Layers className="w-3 h-3" />
            <span>Layer:</span>
          </span>
          {['ALL', 'RED', 'ORANGE', 'GREEN', 'WHITE'].map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory?.(cat)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  isActive 
                    ? cat === 'RED' ? 'bg-rose-600 text-white shadow-xs'
                      : cat === 'ORANGE' ? 'bg-amber-600 text-white shadow-xs'
                      : cat === 'GREEN' ? 'bg-emerald-600 text-white shadow-xs'
                      : cat === 'WHITE' ? 'bg-slate-200 text-slate-900 shadow-xs'
                      : 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat === 'ALL' ? 'All' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Viewport & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-2 relative bg-slate-950 p-4 min-h-[360px] flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-800">
          
          {mappedAreas.length === 0 ? (
            <div className="py-20 text-center space-y-2 text-slate-500">
              <Compass className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
              <p className="text-xs font-semibold">No geographic coordinates mapped for this specific filter.</p>
              <p className="text-[11px] text-slate-600">Refer to the text cards below for statutory details.</p>
            </div>
          ) : (
            <svg
              viewBox="0 0 600 400"
              className="w-full h-auto max-h-[420px] select-none"
            >
              {/* Subtle grid lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                </pattern>
              </defs>
              <rect width="600" height="400" fill="url(#grid)" />

              {/* Connecting cluster lines */}
              {mappedAreas.slice(0, -1).map((a, i) => {
                const p1 = getSvgCoords(a.coordinates.lat, a.coordinates.lng);
                const p2 = getSvgCoords(mappedAreas[i + 1].coordinates.lat, mappedAreas[i + 1].coordinates.lng);
                return (
                  <line
                    key={`line-${i}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.4"
                  />
                );
              })}

              {/* Marker Points */}
              {mappedAreas.map((area) => {
                const pos = getSvgCoords(area.coordinates.lat, area.coordinates.lng);
                const isSelected = String(area._id) === String(activeMarker?._id);
                const color = getMarkerColor(area.category);

                return (
                  <g
                    key={area._id}
                    onClick={() => {
                      setActiveMarkerId(area._id);
                      onSelectArea?.(area);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Pulsing ring for selected marker */}
                    {isSelected && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="16"
                        fill={color}
                        opacity="0.25"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer glow ring */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? "11" : "8"}
                      fill={color}
                      opacity={isSelected ? "0.9" : "0.7"}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? "2.5" : "1.5"}
                      className="transition-all duration-300"
                    />

                    {/* Center dot */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="3"
                      fill="#ffffff"
                    />

                    {/* Text Label on hover or select */}
                    <text
                      x={pos.x}
                      y={pos.y - 14}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={isSelected ? "11" : "9"}
                      fontWeight={isSelected ? "bold" : "normal"}
                      className="pointer-events-none drop-shadow-md"
                    >
                      {area.industrialArea.split(' ')[0]} ({area.category[0]})
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Compass Rose Indicator */}
          <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-center text-[10px] text-slate-400 font-mono">
            <div>▲ N</div>
            <div className="text-[8px] opacity-70">W ┼ E</div>
            <div>▼ S</div>
          </div>

          {/* Note about unmapped coordinates */}
          {unmappedCount > 0 && (
            <div className="absolute bottom-3 left-4 text-[10px] text-slate-400 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
              * Note: {unmappedCount} area(s) without verified GPS coordinates are listed in the cards below.
            </div>
          )}
        </div>

        {/* Selected Area Interactive Sidebar Details */}
        <div className="p-6 bg-slate-900/40 flex flex-col justify-between space-y-4">
          {activeMarker ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${POLLUTION_CATEGORIES[activeMarker.category]?.color || 'bg-slate-800 text-slate-300'}`}>
                  {POLLUTION_CATEGORIES[activeMarker.category]?.badge || activeMarker.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-brand-400" />
                  <span>{activeMarker.coordinates.lat.toFixed(3)}°N, {activeMarker.coordinates.lng.toFixed(3)}°E</span>
                </span>
              </div>

              <div>
                <h4 className="text-lg font-black text-white leading-tight">
                  {activeMarker.industrialArea}
                </h4>
                <p className="text-xs text-brand-400 font-semibold mt-0.5">
                  {activeMarker.district}, {activeMarker.state}
                </p>
              </div>

              {/* Status Badge */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">Siting Status</span>
                <div className="flex items-center space-x-2">
                  {activeMarker.eligibilityStatus === 'Allowed' ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : activeMarker.eligibilityStatus === 'Conditional' ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="text-sm font-bold text-white">{activeMarker.eligibilityStatus}</span>
                </div>
              </div>

              {/* Statutory Conditions */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Verified Conditions & Siting Rules</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  {activeMarker.conditions}
                </p>
              </div>

              {/* Regulatory Authority & Source */}
              <div className="space-y-1 text-xs">
                <div className="text-slate-400">
                  <span className="font-semibold text-slate-300">Authority: </span>
                  {activeMarker.authority}
                </div>
                <div className="text-slate-400 pt-1">
                  <span className="font-semibold text-slate-300">Official Source: </span>
                  <span className="italic">{activeMarker.sourceTitle}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 pt-1">
                  <Calendar className="w-3 h-3" />
                  <span>Last verified: {formatVerificationDate(activeMarker.lastVerifiedAt)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Select any marker on the map to inspect industrial zone parameters.
            </div>
          )}

          {activeMarker?.sourceUrl && (
            <a
              href={activeMarker.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-brand-700 hover:bg-brand-600 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 text-center"
            >
              <span>View Official Siting Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

      </div>

    </div>
  );
};
