import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BusinessForm } from './components/BusinessForm';
import { RequirementsView } from './components/RequirementsView';
import { ComplianceSection } from './components/ComplianceSection';
import { SchemesSection } from './components/SchemesSection';
import { EntrepreneurDashboard } from './components/EntrepreneurDashboard';
import { OfficerPortal } from './components/OfficerPortal';
import { AuthModal } from './components/AuthModal';
import { HelpSection } from './components/HelpSection';
import { Footer } from './components/Footer';
import { VerificationPage } from './pages/VerificationPage';
import { AdminDashboard } from './pages/AdminDashboard';

import { getRequirements } from './data/requirementsData';
import { getStoredApplications, saveStoredApplications } from './data/initialApplications';

export default function App() {
  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState('home'); // 'home', 'wizard', 'compliance', 'schemes', 'dashboard', 'officer', 'help'
  const [activeRole, setActiveRole] = useState('visitor'); // 'visitor', 'entrepreneur', 'officer', 'admin'
  const [currentUser, setCurrentUser] = useState(() => { try { return JSON.parse(localStorage.getItem('udyamone_user') || 'null'); } catch { return null; } });

  // Form selections (Default initialized to the primary MVP Demo scenario: Maharashtra > Pune > Manufacturing)
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  const [selectedIndustry, setSelectedIndustry] = useState('Manufacturing');

  // Page 2 State: When user submits the form, requirementsResult is generated
  const [requirementsResult, setRequirementsResult] = useState(null);
  const [viewingPage2, setViewingPage2] = useState(false);

  // Applications State (Synced with localStorage for real-time Officer <-> Entrepreneur updates)
  const [applications, setApplications] = useState(() => getStoredApplications());

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Toast message
  const [toastMessage, setToastMessage] = useState('');

  // Persist applications whenever changed
  useEffect(() => {
    saveStoredApplications(applications);
  }, [applications]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Form submission handler -> Triggers Page 2 results
  const handleFindApprovals = () => {
    const results = getRequirements(selectedState, selectedDistrict, selectedIndustry);
    setRequirementsResult(results);
    setViewingPage2(true);
    // Smooth scroll to top of requirements
    window.scrollTo({ top: 380, behavior: 'smooth' });
    showToast(`Requirements generated for ${selectedIndustry} in ${selectedDistrict}, ${selectedState}!`);
  };

  // Preset selector
  const handleSelectPreset = (state, district, industry) => {
    setSelectedState(state);
    setSelectedDistrict(district);
    setSelectedIndustry(industry);
    const results = getRequirements(state, district, industry);
    setRequirementsResult(results);
    setViewingPage2(true);
    setCurrentTab('home');
    window.scrollTo({ top: 380, behavior: 'smooth' });
    showToast(`Loaded preset: ${district}, ${state} • ${industry}`);
  };

  // Back from Page 2 to Page 1 selection
  const handleBackToForm = () => {
    setViewingPage2(false);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  // Apply directly from Page 2 into entrepreneur applications
  const handleApplyForApprovalFromPage2 = (approval) => {
    const newId = `MH-${Math.floor(10000 + Math.random() * 90000)}`;
    const newApp = {
      id: newId,
      applicant: "ABC Manufacturing Pvt. Ltd.",
      promoter: "Vikramaditya Sharma",
      contactEmail: "contact@abcmfg.in",
      contactPhone: "+91 98201 44521",
      state: selectedState,
      district: selectedDistrict,
      location: `Plot No. 42, MIDC Bhosari, ${selectedDistrict}, ${selectedState}`,
      industry: selectedIndustry,
      approval: approval.name,
      department: approval.department,
      submissionDate: new Date().toISOString().split('T')[0],
      status: "Under Review",
      currentStageIndex: 1,
      requiredAction: "Department evaluating submitted engineering documents",
      officerNotes: "Application lodged via UdyamOne Single-Window Portal. Scrutiny initiated.",
      stages: [
        { name: "Application Submitted", date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), done: true, remarks: "Dossier uploaded and e-challan acknowledged" },
        { name: "Document Verification", date: "In Progress", done: false, active: true, remarks: "Scrutiny officer reviewing drawings" },
        { name: "Department Review", date: "Upcoming", done: false, remarks: "Technical committee review" },
        { name: "Site Inspection", date: "Scheduled", done: false, remarks: "Field inspector inspection" },
        { name: "Approval & Grant of License", date: "Pending", done: false, remarks: "Digital Certificate release" }
      ],
      submittedDocs: [
        { name: "Building Layout / Site Plan", file: "site_plan.pdf", status: "Uploaded" },
        { name: "Business PAN & Incorporation", file: "pan_incorporation.pdf", status: "Uploaded" }
      ],
      certificateNumber: null
    };

    setApplications([newApp, ...applications]);
    setActiveRole('entrepreneur');
    setCurrentTab('dashboard');
    showToast(`Application ${newId} for "${approval.name}" successfully created!`);
  };

  // Officer updates application (approve, clarify, reject)
  const handleUpdateApplicationByOfficer = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    showToast(`Officer update saved for Application ${updatedApp.id}!`);
  };

  // Auth handler
  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthenticated = (user) => {
    setCurrentUser(user);
    const role = user.role === 'admin' ? 'admin' : 'entrepreneur';
    setActiveRole(role);
    setCurrentTab(role === 'admin' ? 'admin' : 'dashboard');
    showToast(`Welcome ${user.name}`);
  };

  const handleLoginAs = (role) => {
    setActiveRole(role);
    if (role === 'entrepreneur') {
      setCurrentTab('dashboard');
      showToast('Logged in as ABC Manufacturing Pvt. Ltd.');
    } else if (role === 'officer') {
      setCurrentTab('officer');
      showToast('Logged in as Government Review Officer');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-950/90 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-slate-700 flex items-center space-x-2.5 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Area based on currentTab */}
      <main className="flex-1">
        
        {/* TAB 1: HOME & DISCOVERY WIZARD */}
        {currentTab === 'home' && (
          <>
            {/* Hero Section */}
            <Hero
              onGetStarted={() => {
                const el = document.getElementById('requirements-wizard');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreServices={() => {
                setCurrentTab('compliance');
              }}
              onSelectPreset={handleSelectPreset}
            />

            {/* If user hasn't clicked Find Approvals yet: Show Page 1 Business Requirement Form */}
            {!viewingPage2 ? (
              <div className="py-6">
                <BusinessForm
                  selectedState={selectedState}
                  setSelectedState={setSelectedState}
                  selectedDistrict={selectedDistrict}
                  setSelectedDistrict={setSelectedDistrict}
                  selectedIndustry={selectedIndustry}
                  setSelectedIndustry={setSelectedIndustry}
                  onSubmit={handleFindApprovals}
                />
              </div>
            ) : (
              /* If user has clicked Find Approvals: Show Page 2 Personalized Requirements */
              <RequirementsView
                requirements={requirementsResult}
                onBack={handleBackToForm}
                onApplyForApproval={handleApplyForApprovalFromPage2}
                onNavigateToSchemes={() => setCurrentTab('schemes')}
              />
            )}

            {/* Quick Preview of Compliance & Schemes below Hero if not on Page 2 */}
            {!viewingPage2 && (
              <div className="space-y-16 pb-16">
                <ComplianceSection />
                <SchemesSection selectedIndustry={selectedIndustry} selectedState={selectedState} />
              </div>
            )}
          </>
        )}

        {/* TAB 2: DIRECT SERVICES & APPROVALS WIZARD */}
        {currentTab === 'wizard' && (
          <div className="pt-8 pb-16">
            {!viewingPage2 ? (
              <BusinessForm
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={setSelectedDistrict}
                selectedIndustry={selectedIndustry}
                setSelectedIndustry={setSelectedIndustry}
                onSubmit={handleFindApprovals}
              />
            ) : (
              <RequirementsView
                requirements={requirementsResult}
                onBack={handleBackToForm}
                onApplyForApproval={handleApplyForApprovalFromPage2}
                onNavigateToSchemes={() => setCurrentTab('schemes')}
              />
            )}
          </div>
        )}

        {/* TAB 3: COMPLIANCE DASHBOARD */}
        {currentTab === 'compliance' && (
          <div className="py-4">
            <ComplianceSection />
          </div>
        )}

        {/* TAB 4: GOVERNMENT SCHEMES */}
        {currentTab === 'schemes' && (
          <div className="py-4">
            <SchemesSection selectedIndustry={selectedIndustry} selectedState={selectedState} />
          </div>
        )}

        {/* TAB 5: ENTREPRENEUR DASHBOARD */}
        {currentTab === 'verification' && (
          <VerificationPage onComplete={() => setCurrentUser(prev => prev ? ({ ...prev, verificationStatus: 'verified' }) : prev)} onBack={() => setCurrentTab('dashboard')} />
        )}

        {currentTab === 'admin' && activeRole === 'admin' && (
          <AdminDashboard />
        )}

        {currentTab === 'dashboard' && (
          <div className="py-4">
            <EntrepreneurDashboard
              applications={applications}
              onStartNewApplication={() => {
                setCurrentTab('home');
                setViewingPage2(false);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              onViewCompliance={() => setCurrentTab('compliance')}
              onViewSchemes={() => setCurrentTab('schemes')}
              onVerifyIdentity={() => setCurrentTab('verification')}
              verificationStatus={currentUser?.verificationStatus || 'not_verified'}
            />
          </div>
        )}

        {/* TAB 6: GOVERNMENT OFFICER REVIEW DESK */}
        {currentTab === 'officer' && (
          <div className="py-4">
            <OfficerPortal
              applications={applications}
              onUpdateApplication={handleUpdateApplicationByOfficer}
            />
          </div>
        )}

        {/* TAB 7: HELP & FAQS */}
        {currentTab === 'help' && (
          <div className="py-4">
            <HelpSection />
          </div>
        )}

      </main>

      {/* Auth Modal (Login / Register / Fast Demo Login) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginAs={handleLoginAs}
        onAuthenticated={handleAuthenticated}
      />

      {/* Global Footer */}
      <Footer onNavigate={(tab) => {
        setCurrentTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

    </div>
  );
}
