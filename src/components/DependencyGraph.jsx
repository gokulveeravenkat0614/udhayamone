import React, { useState } from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Unlock, 
  ArrowRight, 
  ExternalLink, 
  Layers, 
  AlertTriangle,
  Info,
  ShieldCheck,
  Building,
  ChevronRight,
  FileText
} from 'lucide-react';

export const DependencyGraph = ({ 
  dependencyGraph, 
  onStartApplicationForApproval, 
  onViewDetails 
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState(() => {
    return dependencyGraph?.nodes?.[0]?.id || null;
  });
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('all');

  if (!dependencyGraph || !dependencyGraph.nodes || dependencyGraph.nodes.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-500">
        No dependency graph available for this selection.
      </div>
    );
  }

  const { nodes, edges, phases, actionableCount, blockedCount } = dependencyGraph;

  // Selected node object
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Filter nodes by phase if requested
  const visibleNodes = selectedPhaseFilter === 'all' 
    ? nodes 
    : nodes.filter(n => n.phase === parseInt(selectedPhaseFilter, 10));

  const getStatusBadge = (node) => {
    if (node.status === 'Approved' || node.status === 'APPROVED') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>APPROVED</span>
        </span>
      );
    }
    if (node.status === 'Under Review' || node.status === 'UNDER REVIEW') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Clock className="w-3 h-3 text-blue-600" />
          <span>UNDER REVIEW</span>
        </span>
      );
    }
    if (node.isActionable) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse">
          <Unlock className="w-3 h-3 text-indigo-600" />
          <span>READY TO APPLY</span>
        </span>
      );
    }
    if (node.isBlocked) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
          <Lock className="w-3 h-3 text-slate-500" />
          <span>PREREQUISITES NEEDED</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        <span>CHECK APPLICABILITY</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Graph Header & Metrics */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-blue-50 text-brand-800 text-xs font-bold border border-blue-100 mb-2">
              <GitBranch className="w-4 h-4 text-brand-600" />
              <span>Statutory Approval Dependency Engine</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Interactive Approval Dependency Graph
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-3xl">
              Government clearances must be obtained in statutory sequence. Approvals are organized into 4 lifecycle stages with prerequisite links.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3.5 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs">
              <span className="font-bold text-indigo-700">{actionableCount}</span> Actionable Now
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs">
              <span className="font-bold text-slate-900">{blockedCount}</span> Awaiting Prior Stage
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
              <span className="font-bold text-blue-700">{edges.length}</span> Prerequisite Links
            </div>
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-bold pb-1">
            <span className="text-slate-400 font-semibold mr-1 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1" /> View Phase:
            </span>
            <button
              onClick={() => setSelectedPhaseFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedPhaseFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Stages ({nodes.length})
            </button>
            {phases.map(p => (
              <button
                key={p.phaseNumber}
                onClick={() => setSelectedPhaseFilter(String(p.phaseNumber))}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedPhaseFilter === String(p.phaseNumber)
                    ? 'bg-brand-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Phase {p.phaseNumber} ({p.nodes.length})
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Click any node card to inspect its prerequisite chain</span>
          </div>
        </div>
      </div>

      {/* Main Graph Grid: Visual Swimlane Flow + Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT/CENTER: 4-Phase Swimlane Workflow (7 or 8 columns on large) */}
        <div className="lg:col-span-8 space-y-6">
          
          {phases.map((phase) => {
            const phaseNodes = phase.nodes.filter(n => 
              selectedPhaseFilter === 'all' || selectedPhaseFilter === String(phase.phaseNumber)
            );

            if (phaseNodes.length === 0) return null;

            return (
              <div 
                key={phase.phaseNumber}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft relative overflow-hidden"
              >
                {/* Phase Title Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-xl bg-brand-800 text-white flex items-center justify-center text-xs font-black">
                      {phase.phaseNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {phase.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {phase.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {phaseNodes.length} {phaseNodes.length === 1 ? 'Approval' : 'Approvals'}
                  </span>
                </div>

                {/* Nodes inside this phase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phaseNodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const hasPrereqs = node.prerequisites && node.prerequisites.length > 0;
                    const hasDependents = node.dependents && node.dependents.length > 0;

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-50/50 border-brand-600 shadow-md ring-4 ring-brand-500/10'
                            : 'bg-slate-50/80 hover:bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 uppercase">
                              {node.category}
                            </span>
                            {getStatusBadge(node)}
                          </div>

                          <h5 className="text-sm font-bold text-slate-900 group-hover:text-brand-700 leading-snug">
                            {node.name}
                          </h5>

                          <div className="text-[11px] text-slate-600 mt-1 flex items-center space-x-1 truncate">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{node.authority}</span>
                          </div>
                        </div>

                        {/* Prerequisite & Downstream Indicators */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center space-x-1">
                            {hasPrereqs ? (
                              <span className="font-semibold text-slate-700">
                                🔗 {node.prerequisites.length} Prerequisite{node.prerequisites.length > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-0.5" /> Direct Entry
                              </span>
                            )}
                          </span>

                          <span className="flex items-center space-x-1">
                            {hasDependents ? (
                              <span className="text-brand-700 font-semibold">
                                Unlocks {node.dependents.length} →
                              </span>
                            ) : (
                              <span className="text-slate-400">Terminal License</span>
                            )}
                          </span>
                        </div>

                        {/* Visual edge connector indicator if selected */}
                        {isSelected && (
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] shadow-sm hidden lg:flex">
                            ▶
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}

        </div>

        {/* RIGHT: Node Inspector & Prerequisite Chain Drawer (4 columns on large) */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            
            {selectedNode ? (
              <div className="bg-white rounded-3xl p-6 border-2 border-brand-500/30 shadow-lg relative overflow-hidden space-y-5">
                
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200 uppercase">
                      Phase {selectedNode.phase}: {selectedNode.phaseName}
                    </span>
                    {getStatusBadge(selectedNode)}
                  </div>

                  <h4 className="text-lg font-black text-slate-900 leading-tight">
                    {selectedNode.name}
                  </h4>

                  <div className="mt-1 text-xs text-slate-600">
                    <strong className="text-slate-800">Authority: </strong>
                    <span>{selectedNode.authority}</span>
                  </div>
                </div>

                {/* Statutory Basis */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="font-bold text-slate-700 flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5 text-brand-600" />
                    <span>Statutory Legal Framework</span>
                  </div>
                  <div className="text-slate-600 text-[11px] leading-relaxed">
                    {selectedNode.officialSource || 'Published state & central statutory rules'}
                  </div>
                  <div className="text-slate-500 text-[11px] pt-1">
                    Typical processing time: <strong className="text-slate-800">{selectedNode.estimatedDays}</strong>
                  </div>
                </div>

                {/* Prerequisite Chain Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Required Prerequisites:</span>
                    <span className="text-[11px] text-slate-500">
                      {selectedNode.prerequisites?.length || 0} required
                    </span>
                  </div>

                  {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedNode.prerequisites.map((prereqId) => {
                        const prereqNode = nodes.find(n => n.id === prereqId);
                        const isDone = prereqNode?.status === 'Approved' || prereqNode?.status === 'APPROVED';

                        return (
                          <div
                            key={prereqId}
                            onClick={() => prereqNode && setSelectedNodeId(prereqNode.id)}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs cursor-pointer transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                              )}
                              <span className={`font-semibold ${isDone ? 'text-slate-700' : 'text-slate-900'}`}>
                                {prereqNode?.name || prereqId}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                              Phase {prereqNode?.phase || 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>No prior approvals needed. You can apply directly!</span>
                    </div>
                  )}
                </div>

                {/* Downstream Unlocks */}
                {selectedNode.dependents && selectedNode.dependents.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800">
                      Unlocks Downstream Clearances:
                    </div>
                    <div className="space-y-1">
                      {selectedNode.dependents.map((depId) => {
                        const depNode = nodes.find(n => n.id === depId);
                        return (
                          <div
                            key={depId}
                            onClick={() => depNode && setSelectedNodeId(depNode.id)}
                            className="p-2 rounded-lg bg-blue-50/50 hover:bg-blue-100/60 text-brand-900 text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <span>→ {depNode?.name || depId}</span>
                            <span className="text-[10px] text-brand-700">Phase {depNode?.phase}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(selectedNode)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Full Requirements & Documents</span>
                    </button>
                  )}

                  {selectedNode.sourceUrl && (
                    <a
                      href={selectedNode.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-brand-700 font-bold text-xs border border-brand-200 transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <span>Open Official Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {onStartApplicationForApproval && selectedNode.isActionable && (
                    <button
                      onClick={() => onStartApplicationForApproval(selectedNode)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-700 to-blue-700 hover:from-brand-800 hover:to-blue-800 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-98"
                    >
                      <span>Start Application on Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            ) : null}

            {/* Dependency Legend Box */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 text-xs space-y-2 text-slate-600">
              <div className="font-bold text-slate-800 text-xs">Dependency Status Legend:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Approved</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>Under Review</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  <span>Ready to Apply</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span>Waiting on Prior Stage</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
