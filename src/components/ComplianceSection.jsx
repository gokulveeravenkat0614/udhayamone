import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  Plus, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Trash2, 
  Info, 
  X
} from 'lucide-react';
import { 
  getStoredComplianceItems, 
  saveStoredComplianceItems, 
  getStatutoryReferenceCycles 
} from '../data/complianceData';

export const ComplianceSection = ({ selectedState = 'Maharashtra' }) => {
  const [items, setItems] = useState(() => getStoredComplianceItems());
  const [showAddModal, setShowAddModal] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [authorityInput, setAuthorityInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [sessionToast, setSessionToast] = useState('');

  // Persist user items
  useEffect(() => {
    saveStoredComplianceItems(items);
  }, [items]);

  const handleAddCompliance = (e) => {
    e.preventDefault();
    if (!nameInput || !dateInput) return;

    const newItem = {
      id: `user-comp-${Date.now()}`,
      name: nameInput,
      dueDate: dateInput,
      authority: authorityInput || 'Concerned Authority',
      notes: notesInput || '',
      status: 'Upcoming',
      createdAt: new Date().toISOString()
    };

    setItems([newItem, ...items]);
    setShowAddModal(false);
    setNameInput('');
    setDateInput('');
    setAuthorityInput('');
    setNotesInput('');
    setSessionToast(`Compliance item "${newItem.name}" added successfully.`);
    setTimeout(() => setSessionToast(''), 3000);
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(i => i.id !== id));
    setSessionToast('Compliance item deleted.');
    setTimeout(() => setSessionToast(''), 2500);
  };

  const handleToggleComplete = (id) => {
    setItems(items.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status: i.status === 'Completed' ? 'Upcoming' : 'Completed'
        };
      }
      return i;
    }));
  };

  const getDaysRemaining = (dueDateStr) => {
    const diff = Math.ceil((new Date(dueDateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days past`;
    if (diff === 0) return `Due today`;
    return `${diff} days left`;
  };

  const upcomingCount = items.filter(i => i.status !== 'Completed').length;
  const completedCount = items.filter(i => i.status === 'Completed').length;

  return (
    <div id="compliance-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 animate-fadeIn">
      
      {/* Session Toast */}
      {sessionToast && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{sessionToast}</span>
          </div>
          <button onClick={() => setSessionToast('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-brand-800 text-xs font-bold mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Compliance Tracker</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Stay Compliant
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Add statutory deadlines for your factory licenses, fire audits, environmental filings, and returns to track them in one place.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Compliance Deadline</span>
          </button>
        </div>
      </div>

      {/* Active User Summary Counters (Calculated from user data, not fabricated) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Deadlines
          </div>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {items.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            User-configured items
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            Upcoming
          </div>
          <div className="text-3xl font-black text-amber-700 mt-1">
            {upcomingCount}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">
            Pending user actions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Completed
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-1">
            {completedCount}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            Acknowledged filings
          </div>
        </div>
      </div>

      {/* User Compliance Deadlines Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            Your Upcoming Compliance Deadlines
          </h3>
          <span className="text-xs text-slate-400">
            {items.length} recorded
          </span>
        </div>

        {/* Empty State as mandated in Rule 18 & 20 */}
        {items.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div className="text-base font-bold text-slate-800">
              No compliance deadlines added yet.
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You haven't configured any compliance reminders. Click "Add Compliance Deadline" above to add your factory, fire, or tax return filing dates.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Deadline</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div 
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 -mx-3 px-3 rounded-2xl transition-colors"
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(item.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                      item.status === 'Completed'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-brand-500 bg-white'
                    }`}
                    title={item.status === 'Completed' ? "Mark as upcoming" : "Mark as completed"}
                  >
                    {item.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-sm font-bold text-slate-900 ${item.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.authority}
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.notes}
                      </p>
                    )}

                    <div className="mt-1 text-xs text-slate-500 flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due Date: <strong>{item.dueDate}</strong> ({getDaysRemaining(item.dueDate)})</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-2 pl-8 sm:pl-0">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Statutory Filing Calendar Reference (Factual Reference only) */}
      <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Info className="w-4 h-4 text-brand-700" />
          <span>Statutory Filing Calendar Reference (Official Schedules)</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Standard statutory periodic cycles mandated by Central and State regulations. Verify applicability with the respective authority.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {getStatutoryReferenceCycles(selectedState).map((ref, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900">{ref.title}</div>
              <div className="text-slate-600">
                <span className="font-semibold text-slate-700">Cycle: </span>
                {ref.frequency}
              </div>
              <div className="text-[11px] text-brand-700 font-medium">
                Authority: {ref.authority}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Compliance Deadline Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scaleUp relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-slate-900">
              Add Compliance Deadline
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a real statutory deadline to keep your unit compliant.
            </p>

            <form onSubmit={handleAddCompliance} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Compliance Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Factory Licence Annual Renewal"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-600 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
                <input 
                  type="date" 
                  required
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-600 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Concerned Authority (Optional)</label>
                <input 
                  type="text" 
                  placeholder={selectedState === 'Telangana' ? 'e.g. Department of Factories, Telangana' : 'e.g. Directorate of Industrial Safety & Health (DISH)'}
                  value={authorityInput}
                  onChange={(e) => setAuthorityInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-600 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Reminder (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Prepare Form 2 and treasury challan"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-brand-600 outline-hidden font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold cursor-pointer"
                >
                  Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
