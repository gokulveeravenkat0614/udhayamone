import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  RefreshCw, 
  ShieldCheck, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  AlertCircle, 
  ExternalLink,
  Layers,
  FileCheck
} from 'lucide-react';
import { adminApi, industryAreaApi } from '../services/api';
import { STATES_AND_DISTRICTS } from '../data/locations';
import { POLLUTION_CATEGORIES, formatVerificationDate, isRecordOutdated } from '../services/industryAreaHelper';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'industry-areas'
  
  // Verification State
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  // Industry Area State
  const [areas, setAreas] = useState([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [areaStateFilter, setAreaStateFilter] = useState('All');
  const [areaMsg, setAreaMsg] = useState({ type: '', text: '' });
  
  // Area Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    state: 'Maharashtra',
    district: 'Pune',
    industrialArea: '',
    category: 'ORANGE',
    industryType: '',
    eligibilityStatus: 'Allowed',
    conditions: '',
    authority: 'Maharashtra Pollution Control Board (MPCB)',
    sourceUrl: '',
    sourceTitle: '',
    lastVerifiedAt: new Date().toISOString().split('T')[0]
  });

  const loadVerificationData = async () => {
    try {
      const [s, v] = await Promise.all([adminApi.stats(), adminApi.verifications()]);
      setStats(s.statistics);
      setRecords(v.verifications || []);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const loadIndustryAreas = useCallback(async () => {
    try {
      setAreasLoading(true);
      const queryState = areaStateFilter !== 'All' ? areaStateFilter : 'Maharashtra';
      const res = await industryAreaApi.getAreas({
        state: queryState
      });
      if (res && res.success && Array.isArray(res.areas)) {
        setAreas(res.areas);
      } else if (Array.isArray(res)) {
        setAreas(res);
      } else {
        setAreas([]);
      }
    } catch (err) {
      console.error('Failed to load areas for admin:', err);
      setAreaMsg({ type: 'error', text: 'Failed to load industry areas: ' + err.message });
    } finally {
      setAreasLoading(false);
    }
  }, [areaStateFilter]);

  useEffect(() => {
    loadVerificationData();
  }, []);

  useEffect(() => {
    if (activeTab === 'industry-areas') {
      loadIndustryAreas();
    }
  }, [activeTab, loadIndustryAreas]);

  const handleOpenAddModal = () => {
    setEditingArea(null);
    setFormData({
      state: areaStateFilter !== 'All' ? areaStateFilter : 'Maharashtra',
      district: STATES_AND_DISTRICTS[areaStateFilter !== 'All' ? areaStateFilter : 'Maharashtra']?.[0] || 'Pune',
      industrialArea: '',
      category: 'ORANGE',
      industryType: '',
      eligibilityStatus: 'Allowed',
      conditions: '',
      authority: 'State Pollution Control Board',
      sourceUrl: '',
      sourceTitle: '',
      lastVerifiedAt: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (area) => {
    setEditingArea(area);
    setFormData({
      state: area.state,
      district: area.district,
      industrialArea: area.industrialArea,
      category: area.category,
      industryType: Array.isArray(area.industryType) ? area.industryType.join(', ') : (area.industryType || ''),
      eligibilityStatus: area.eligibilityStatus || 'Allowed',
      conditions: area.conditions,
      authority: area.authority,
      sourceUrl: area.sourceUrl || '',
      sourceTitle: area.sourceTitle,
      lastVerifiedAt: area.lastVerifiedAt ? new Date(area.lastVerifiedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSaveArea = async (e) => {
    e.preventDefault();
    if (!formData.state || !formData.district || !formData.industrialArea || !formData.conditions || !formData.authority || !formData.sourceTitle) {
      alert('Please fill all mandatory fields: State, District, Area Name, Conditions, Authority, and Official Source.');
      return;
    }

    try {
      const payload = {
        ...formData,
        industryType: formData.industryType ? formData.industryType.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      if (editingArea) {
        await industryAreaApi.update(editingArea._id, payload);
        setAreaMsg({ type: 'success', text: 'Area record updated successfully!' });
      } else {
        await industryAreaApi.create(payload);
        setAreaMsg({ type: 'success', text: 'New verified industry area added successfully!' });
      }

      setIsModalOpen(false);
      loadIndustryAreas();
      setTimeout(() => setAreaMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      alert('Error saving area: ' + err.message);
    }
  };

  const handleDeleteArea = async (id) => {
    if (!window.confirm('Are you sure you want to delete this industrial area record?')) return;
    try {
      await industryAreaApi.delete(id);
      setAreaMsg({ type: 'info', text: 'Record deleted successfully.' });
      loadIndustryAreas();
      setTimeout(() => setAreaMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-7">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 to-brand-950 rounded-3xl p-7 sm:p-10 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black tracking-widest text-amber-300 uppercase">
              UdyamOne Administration Portal
            </div>
            <h1 className="text-3xl font-black mt-1">Admin Console</h1>
            <p className="text-sm text-blue-100 mt-2">
              Monitor verification outcomes, regulatory records, and audit activity.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {activeTab === 'verification' ? (
              <button 
                onClick={loadVerificationData} 
                className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold flex gap-2 items-center transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4"/> Refresh
              </button>
            ) : (
              <button 
                onClick={handleOpenAddModal}
                className="h-10 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex gap-2 items-center transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4"/> Add Verified Area
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 flex border-b border-white/10 gap-2">
          <button
            onClick={() => setActiveTab('verification')}
            className={`pb-3 px-4 font-black text-xs transition-colors flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'verification'
                ? 'border-brand-400 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Identity Verification Monitor</span>
          </button>
          <button
            onClick={() => setActiveTab('industry-areas')}
            className={`pb-3 px-4 font-black text-xs transition-colors flex items-center space-x-2 border-b-2 cursor-pointer ${
              activeTab === 'industry-areas'
                ? 'border-brand-400 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Industry Area Management</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {areaMsg.text && (
        <div className={`p-4 rounded-xl text-xs font-semibold ${
          areaMsg.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'
        }`}>
          {areaMsg.text}
        </div>
      )}

      {/* TAB 1: IDENTITY VERIFICATION MONITOR */}
      {activeTab === 'verification' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              [Users, 'Users', stats?.total],
              [CheckCircle2, 'Verified', stats?.verified],
              [XCircle, 'Failed', stats?.failed],
              [Clock3, 'Pending', stats?.pending],
              [ShieldCheck, 'Logins', stats?.logins]
            ].map(([Icon, label, val]) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
                <Icon className="w-5 h-5 text-brand-700"/>
                <div className="text-xs font-bold text-slate-500 mt-3">{label}</div>
                <div className="text-3xl font-black text-slate-900">{val ?? '—'}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 overflow-x-auto shadow-2xs">
            <h2 className="text-xl font-black mb-4">Recent verification attempts</h2>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b text-slate-400">
                  <th className="p-3">User</th>
                  <th className="p-3">Document</th>
                  <th className="p-3">Data</th>
                  <th className="p-3">Face</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-3 font-bold">
                      {r.userId?.name || 'Unknown'}
                      <div className="text-[10px] text-slate-400 font-normal">{r.userId?.email || ''}</div>
                    </td>
                    <td className="p-3">{r.documentMatch ? '✓' : '✕'}</td>
                    <td className="p-3">{r.dataMatch ? '✓' : '✕'}</td>
                    <td className="p-3">{r.faceMatch ? '✓' : '✕'}</td>
                    <td className="p-3">{r.confidenceScore == null ? '—' : Math.round(r.confidenceScore * 100) + '%'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg font-bold ${r.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!records.length && !error && (
              <div className="p-8 text-center text-xs text-slate-400">No verification records yet.</div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: INDUSTRY AREA MANAGEMENT */}
      {activeTab === 'industry-areas' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-500">Filter by State:</span>
              <select
                value={areaStateFilter}
                onChange={(e) => setAreaStateFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 outline-hidden"
              >
                {Object.keys(STATES_AND_DISTRICTS).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400 font-medium">
                {areas.length} verified areas registered in {areaStateFilter}
              </span>
              <button
                onClick={loadIndustryAreas}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Reload areas"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Area Records Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 overflow-x-auto shadow-2xs">
            <h2 className="text-xl font-black mb-4">Statutory Industrial Areas Catalog</h2>
            
            {areasLoading ? (
              <div className="py-16 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                <span className="text-xs font-bold">Loading regulatory area records...</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-slate-400">
                    <th className="p-3">Industrial Area / Estate</th>
                    <th className="p-3">District / State</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Authority / Source</th>
                    <th className="p-3">Last Verified</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {areas.map(area => {
                    const cat = POLLUTION_CATEGORIES[area.category] || POLLUTION_CATEGORIES.ORANGE;
                    const isOutdated = isRecordOutdated(area.lastVerifiedAt);

                    return (
                      <tr key={area._id} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 max-w-[200px]">
                          {area.industrialArea}
                          <div className="text-[10px] text-slate-500 font-normal line-clamp-1 mt-0.5">
                            {area.conditions}
                          </div>
                        </td>
                        <td className="p-3 text-slate-700 whitespace-nowrap">
                          {area.district}, {area.state}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] border ${cat.color}`}>
                            {area.category}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800">{area.eligibilityStatus}</span>
                        </td>
                        <td className="p-3 max-w-[220px]">
                          <div className="font-semibold text-slate-800">{area.authority}</div>
                          <div className="text-[10px] text-slate-400 italic line-clamp-1">{area.sourceTitle}</div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="font-bold text-slate-700">{formatVerificationDate(area.lastVerifiedAt)}</div>
                          {isOutdated ? (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                              Verification required
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                              Verified Current
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(area)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteArea(area._id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!areas.length && !areasLoading && (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
                <p>No verified industry areas found for {areaStateFilter}.</p>
                <button
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-1.5 rounded-xl bg-brand-700 text-white font-bold text-xs inline-flex items-center space-x-1 mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Area for {areaStateFilter}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Area Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">
                {editingArea ? 'Edit Verified Industrial Area' : 'Add New Verified Industrial Area'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArea} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      const st = e.target.value;
                      const dists = STATES_AND_DISTRICTS[st] || [];
                      setFormData(prev => ({ ...prev, state: st, district: dists[0] || '' }));
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {Object.keys(STATES_AND_DISTRICTS).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">District *</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {(STATES_AND_DISTRICTS[formData.state] || []).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Industrial Area / Estate Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MIDC Chakan Phase II, SIPCOT Sriperumbudur"
                  value={formData.industrialArea}
                  onChange={(e) => setFormData(prev => ({ ...prev, industrialArea: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pollution Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="RED">🔴 RED (PI ≥ 60)</option>
                    <option value="ORANGE">🟠 ORANGE (41 - 59)</option>
                    <option value="GREEN">🟢 GREEN (21 - 40)</option>
                    <option value="WHITE">⚪ WHITE (Exempt)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Eligibility Status *</label>
                  <select
                    value={formData.eligibilityStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, eligibilityStatus: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="Allowed">Allowed</option>
                    <option value="Conditional">Conditional (CETP / ZLD Mandatory)</option>
                    <option value="Restricted">Restricted / Prohibited</option>
                    <option value="Verification Required">Verification Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Applicable Industry Sectors (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Automobile, Manufacturing, Electronics, Food Processing"
                  value={formData.industryType}
                  onChange={(e) => setFormData(prev => ({ ...prev, industryType: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Statutory Conditions & Siting Rules *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Approved for auto components. Dedicated connection to Chakan CETP required for trade effluent. Standalone bulk synthesis prohibited."
                  value={formData.conditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Regulatory Authority / SPCB *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MPCB & MIDC, TNPCB, GPCB"
                    value={formData.authority}
                    onChange={(e) => setFormData(prev => ({ ...prev, authority: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Last Verified Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.lastVerifiedAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastVerifiedAt: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Regulatory Source Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MPCB Siting Guidelines Notification No. 42/2023"
                  value={formData.sourceTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceTitle: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Source URL (optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold"
                >
                  {editingArea ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
