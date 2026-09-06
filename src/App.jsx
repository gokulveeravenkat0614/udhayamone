import React, { useState, useEffect, useCallback } from 'react';
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

// Client Account Workspace Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ClientDashboard } from './pages/ClientDashboard';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { ApplicationWorkspacePage } from './pages/ApplicationWorkspacePage';
import { ProfilePage } from './pages/ProfilePage';

import { getRequirements } from './data/requirementsData';
import { getStoredApplications, saveStoredApplications } from './data/initialApplications';
import { 
  approvalApi, 
  applicationApi, 
  authApi, 
  getStoredToken, 
  getStoredUser, 
  clearAuthSession 
} from './services/api';

// Lightweight URL Route Parser
function parseRoute(pathname) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';

  if (clean === '/' || clean === '') return { name: 'home', path: '/' };
  if (clean === '/login') return { name: 'login', path: '/login' };
  if (clean === '/register') return { name: 'register', path: '/register' };
  if (clean === '/dashboard') return { name: 'dashboard', path: '/dashboard' };
  if (clean === '/my-applications') return { name: 'my-applications', path: '/my-applications' };
  if (clean === '/profile') return { name: 'profile', path: '/profile' };
  if (clean === '/verify') return { name: 'verify', path: '/verify' };
  if (clean === '/admin') return { name: 'admin', path: '/admin' };
  if (clean === '/officer') return { name: 'officer', path: '/officer' };
  if (clean === '/compliance') return { name: 'compliance', path: '/compliance' };
  if (clean === '/schemes') return { name: 'schemes', path: '/schemes' };
  if (clean === '/wizard' || clean === '/application/new') return { name: 'wizard', path: '/wizard' };
  if (clean === '/help') return { name: 'help', path: '/help' };

  // Match /application/:applicationId/approvals
  const appApprovalsMatch = clean.match(/^\/application\/([^/]+)\/approvals$/);
  if (appApprovalsMatch) {
    return { 
      name: 'application', 
      path: clean, 
      applicationId: decodeURIComponent(appApprovalsMatch[1]), 
      initialTab: 'approvals' 
    };
  }

  // Match /application/:applicationId
  const appMatch = clean.match(/^\/application\/([^/]+)$/);
  if (appMatch) {
    const param = decodeURIComponent(appMatch[1]);
    if (param === 'new') return { name: 'wizard', path: '/wizard' };
    return { 
      name: 'application', 
      path: clean, 
      applicationId: param, 
      initialTab: 'approvals' 
    };
  }

  return { name: 'home', path: '/' };
}

export default function App() {
  // Routing State
  const [currentPath, setCurrentPath] = useState(() => {
    return typeof window !== 'undefined' ? window.location.pathname : '/';
  });

  // Current User Session State (persisted via localStorage + validated via backend)
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [activeRole, setActiveRole] = useState(() => {
    const user = getStoredUser();
    if (user?.role === 'admin') return 'admin';
    return 'entrepreneur';
  });

  // Navigation tab for fallback / legacy
  const [currentTab, setCurrentTab] = useState('home');

  // Form selections (Default initialized to Maharashtra > Pune > Manufacturing)
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState('Pune');
  const [selectedIndustry, setSelectedIndustry] = useState('Manufacturing');

  // Business Operational Profile
  const [businessProfile, setBusinessProfile] = useState({
    entityType: 'Private Limited Company',
    investment: 2.5,
    turnover: 12.0,
    employeeCount: 25,
    powerRequired: 75,
    builtUpArea: 1500,
    usesHazardousChemicals: false,
    isExportOriented: false
  });

  // Page 2 Discovery Results
  const [requirementsResult, setRequirementsResult] = useState(null);
  const [viewingPage2, setViewingPage2] = useState(false);

  // Applications Store for legacy / officer sync
  const [applications, setApplications] = useState(() => getStoredApplications());

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  }, []);

  // URL Navigation helper
  const navigate = useCallback((path, { replace = false } = {}) => {
    if (typeof window !== 'undefined') {
      if (replace) {
        window.history.replaceState({}, '', path);
      } else {
        window.history.pushState({}, '', path);
      }
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize applications from MongoDB backend API (Single Source of Truth)
  const fetchUserApplications = useCallback(async () => {
    try {
      const token = getStoredToken();
      if (!token) return;
      const res = await applicationApi.getMyApplications();
      if (res && res.success && Array.isArray(res.applications)) {
        setApplications(res.applications);
      }
    } catch (err) {
      console.warn('Could not sync applications from MongoDB:', err.message);
    }
  }, []);

  // Validate session token on mount & load applications from MongoDB
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      authApi.me()
        .then((res) => {
          if (res && res.success && res.user) {
            setCurrentUser(res.user);
            if (res.user.role === 'admin') setActiveRole('admin');
            else setActiveRole('entrepreneur');
            fetchUserApplications();
          } else {
            clearAuthSession();
            setCurrentUser(null);
            setApplications([]);
          }
        })
        .catch(() => {
          // Keep cached user if network temporarily unavailable
          const cached = getStoredUser();
          if (cached) setCurrentUser(cached);
        });
    }
  }, [fetchUserApplications]);

  // Persist legacy applications
  useEffect(() => {
    saveStoredApplications(applications);
  }, [applications]);

  // Handle Authentication Success
  const handleAuthenticated = (user, token) => {
    setCurrentUser(user);
    const role = user.role === 'admin' ? 'admin' : 'entrepreneur';
    setActiveRole(role);
    showToast(`Welcome back, ${user.name}!`);
    fetchUserApplications();
    navigate('/dashboard');
  };

  // Handle Logout
  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setApplications([]);
    setActiveRole('visitor');
    showToast('Logged out successfully.');
    navigate('/login');
  };

  // Start New Application Action
  const handleStartNewApplication = () => {
    setViewingPage2(false);
    navigate('/wizard');
  };

  // Form submission handler -> Triggers Page 2 results with API and client engine fallback
  const handleFindApprovals = async () => {
    let results = null;

    try {
      const res = await approvalApi.evaluate({
        state: selectedState,
        district: selectedDistrict,
        industry: selectedIndustry,
        ...businessProfile
      }, applications);
      if (res && res.success && res.data) {
        results = res.data;
      }
    } catch {
      // Backend offline or error -> run client-side rule engine seamlessly
    }

    if (!results) {
      results = getRequirements(selectedState, selectedDistrict, selectedIndustry, businessProfile, applications);
    }

    setRequirementsResult(results);

    // If client is logged in, save to backend and open personal application workspace!
    if (currentUser) {
      try {
        const createRes = await applicationApi.create({
          state: selectedState,
          district: selectedDistrict,
          industry: selectedIndustry,
          businessProfile,
          applicantName: currentUser.name || `${selectedIndustry} Enterprise`,
          promoter: currentUser.name
        });

        if (createRes && createRes.success && createRes.application) {
          const newAppId = createRes.application.applicationId || createRes.application._id;
          showToast(`Application ${newAppId} created! Loading required approvals & sequence...`);
          navigate(`/application/${encodeURIComponent(newAppId)}/approvals`);
          return;
        }
      } catch (err) {
        console.warn('Unable to create backend application record:', err);
      }
    }

    // Unauthenticated or fallback view:
    setViewingPage2(true);
    // Smooth scroll directly to the required government approvals section
    setTimeout(() => {
      const el = document.getElementById('required-approvals-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    showToast(`Required government approvals loaded for ${selectedIndustry} in ${selectedDistrict}, ${selectedState}!`);
  };

  // Preset selector
  const handleSelectPreset = (state, district, industry) => {
    setSelectedState(state);
    setSelectedDistrict(district);
    setSelectedIndustry(industry);

    const updatedProfile = {
      ...businessProfile,
      employeeCount: industry === 'Information Technology' ? 15 : (industry === 'Chemical Industry' ? 30 : 25),
      powerRequired: industry === 'Information Technology' ? 15 : (industry === 'Chemical Industry' ? 100 : 75),
      builtUpArea: industry === 'Information Technology' ? 400 : (industry === 'Chemical Industry' ? 2500 : 1500),
      usesHazardousChemicals: industry === 'Chemical Industry'
    };
    setBusinessProfile(updatedProfile);

    const results = getRequirements(state, district, industry, updatedProfile, applications);
    setRequirementsResult(results);
    setViewingPage2(true);
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById('required-approvals-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    showToast(`Loaded preset: ${district}, ${state} • ${industry}`);
  };

  // Back from Page 2 to Form
  const handleBackToForm = () => {
    setViewingPage2(false);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  // Apply directly from Page 2
  const handleApplyForApprovalFromPage2 = (approval) => {
    if (!currentUser) {
      showToast('Please log in or register to create and track applications.');
      navigate('/login');
      return;
    }

    const statePrefixMap = {
      Telangana: 'TG',
      Maharashtra: 'MH',
      Karnataka: 'KA',
      Gujarat: 'GJ',
      'Tamil Nadu': 'TN',
      'Andhra Pradesh': 'AP',
      Delhi: 'DL'
    };
    const statePrefix = statePrefixMap[selectedState] || (selectedState || 'IN').slice(0, 2).toUpperCase();
    const newId = `${statePrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    const industrialZone = selectedState === 'Telangana' 
      ? 'TSIIC Industrial Park' 
      : (selectedState === 'Maharashtra' ? (selectedDistrict === 'Pune' ? 'MIDC Bhosari' : 'MIDC') : 'Industrial Estate');

    const newApp = {
      id: newId,
      applicant: currentUser.name || (selectedState === 'Telangana' ? "Telangana Precision Engineering Pvt. Ltd." : "ABC Manufacturing Pvt. Ltd."),
      promoter: currentUser.name || (selectedState === 'Telangana' ? "K. V. Rao" : "Vikramaditya Sharma"),
      contactEmail: currentUser.email || "contact@abcmfg.in",
      contactPhone: currentUser.mobile || "+91 98201 44521",
      state: selectedState,
      district: selectedDistrict,
      location: `Plot No. 42, ${industrialZone}, ${selectedDistrict}, ${selectedState}`,
      industry: selectedIndustry,
      approval: approval.name,
      department: approval.department,
      submissionDate: new Date().toISOString().split('T')[0],
      status: "Under Review",
      currentStageIndex: 1,
      requiredAction: "Department evaluating submitted engineering documents",
      officerNotes: "Application lodged via UdyamOne Single-Window Portal.",
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
    showToast(`Application ${newId} for "${approval.name}" successfully created!`);
    navigate('/dashboard');
  };

  // Officer updates
  const handleUpdateApplicationByOfficer = (updatedApp) => {
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
    showToast(`Officer update saved for Application ${updatedApp.id}!`);
  };

  // Route Analysis & Protection
  const currentRoute = parseRoute(currentPath);
  const protectedRoutes = ['dashboard', 'my-applications', 'application', 'profile'];
  const isProtectedRoute = protectedRoutes.includes(currentRoute.name);

  // Unauthenticated access to protected route redirects to /login
  useEffect(() => {
    if (isProtectedRoute && !currentUser) {
      showToast('Please log in to access your personal workspace.');
      navigate('/login', { replace: true });
    }
  }, [currentRoute.name, currentUser, isProtectedRoute, navigate, showToast]);

  // Authenticated user on /login or /register redirects to /dashboard
  useEffect(() => {
    if (currentUser && (currentRoute.name === 'login' || currentRoute.name === 'register')) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentRoute.name, currentUser, navigate]);

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
        currentTab={currentRoute.name}
        setCurrentTab={(tab) => navigate(tab === 'home' ? '/' : `/${tab}`)}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={navigate}
        onStartNewApplication={handleStartNewApplication}
      />

      {/* Main Routed Content */}
      <main className="flex-1">

        {/* 1. LOGIN PAGE */}
        {currentRoute.name === 'login' && (
          <LoginPage
            onLoginSuccess={handleAuthenticated}
            onNavigate={navigate}
          />
        )}

        {/* 2. REGISTER PAGE */}
        {currentRoute.name === 'register' && (
          <RegisterPage
            onRegisterSuccess={handleAuthenticated}
            onNavigate={navigate}
          />
        )}

        {/* 3. CLIENT DASHBOARD */}
        {currentRoute.name === 'dashboard' && currentUser && (
          <ClientDashboard
            currentUser={currentUser}
            onNavigate={navigate}
            onStartNewApplication={handleStartNewApplication}
          />
        )}

        {/* 4. MY APPLICATIONS PAGE */}
        {currentRoute.name === 'my-applications' && currentUser && (
          <MyApplicationsPage
            currentUser={currentUser}
            onNavigate={navigate}
            onStartNewApplication={handleStartNewApplication}
          />
        )}

        {/* 5. APPLICATION WORKSPACE PAGE */}
        {currentRoute.name === 'application' && currentUser && (
          <ApplicationWorkspacePage
            applicationId={currentRoute.applicationId}
            initialTab={currentRoute.initialTab || 'approvals'}
            onNavigate={navigate}
            onToast={showToast}
          />
        )}

        {/* 6. PROFILE PAGE */}
        {currentRoute.name === 'profile' && currentUser && (
          <ProfilePage
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={navigate}
          />
        )}

        {/* 7. WIZARD / REQUIREMENTS DISCOVERY PAGE */}
        {currentRoute.name === 'wizard' && (
          <div className="pt-8 pb-16">
            {!viewingPage2 ? (
              <BusinessForm
                selectedState={selectedState}
                setSelectedState={setSelectedState}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={setSelectedDistrict}
                selectedIndustry={selectedIndustry}
                setSelectedIndustry={setSelectedIndustry}
                businessProfile={businessProfile}
                setBusinessProfile={setBusinessProfile}
                onSubmit={handleFindApprovals}
              />
            ) : (
              <RequirementsView
                requirements={requirementsResult}
                onBack={handleBackToForm}
                onApplyForApproval={handleApplyForApprovalFromPage2}
                userApplications={applications}
                onNavigateToSchemes={() => navigate('/schemes')}
              />
            )}
          </div>
        )}

        {/* 8. COMPLIANCE VIEW */}
        {currentRoute.name === 'compliance' && (
          <div className="py-4">
            <ComplianceSection selectedState={selectedState} />
          </div>
        )}

        {/* 9. SCHEMES VIEW */}
        {currentRoute.name === 'schemes' && (
          <div className="py-4">
            <SchemesSection selectedIndustry={selectedIndustry} selectedState={selectedState} />
          </div>
        )}

        {/* 10. IDENTITY VERIFICATION PAGE */}
        {currentRoute.name === 'verify' && (
          <VerificationPage 
            onComplete={() => {
              setCurrentUser(prev => prev ? ({ ...prev, verificationStatus: 'verified' }) : prev);
              navigate('/dashboard');
            }} 
            onBack={() => navigate('/dashboard')} 
          />
        )}

        {/* 11. ADMIN CONSOLE */}
        {currentRoute.name === 'admin' && (
          <AdminDashboard />
        )}

        {/* 12. OFFICER REVIEW DESK */}
        {currentRoute.name === 'officer' && (
          <div className="py-4">
            <OfficerPortal
              applications={applications}
              onUpdateApplication={handleUpdateApplicationByOfficer}
            />
          </div>
        )}

        {/* 13. HELP & FAQS */}
        {currentRoute.name === 'help' && (
          <div className="py-4">
            <HelpSection />
          </div>
        )}

        {/* 14. HOME / LANDING PAGE */}
        {currentRoute.name === 'home' && (
          <>
            <Hero
              selectedState={selectedState}
              onGetStarted={() => {
                const el = document.getElementById('requirements-wizard');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreServices={() => navigate('/compliance')}
              onSelectPreset={handleSelectPreset}
            />

            {!viewingPage2 ? (
              <div className="py-6">
                <BusinessForm
                  selectedState={selectedState}
                  setSelectedState={setSelectedState}
                  selectedDistrict={selectedDistrict}
                  setSelectedDistrict={setSelectedDistrict}
                  selectedIndustry={selectedIndustry}
                  setSelectedIndustry={setSelectedIndustry}
                  businessProfile={businessProfile}
                  setBusinessProfile={setBusinessProfile}
                  onSubmit={handleFindApprovals}
                />
              </div>
            ) : (
              <RequirementsView
                requirements={requirementsResult}
                onBack={handleBackToForm}
                onApplyForApproval={handleApplyForApprovalFromPage2}
                userApplications={applications}
                onNavigateToSchemes={() => navigate('/schemes')}
              />
            )}

            {!viewingPage2 && (
              <div className="space-y-16 pb-16">
                <ComplianceSection />
                <SchemesSection selectedIndustry={selectedIndustry} selectedState={selectedState} />
              </div>
            )}
          </>
        )}

      </main>

      {/* Legacy Auth Modal Support */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginAs={(role) => {
          setActiveRole(role);
          if (role === 'entrepreneur') navigate('/dashboard');
          else if (role === 'officer') navigate('/officer');
        }}
        onAuthenticated={handleAuthenticated}
      />

      {/* Global Footer */}
      <Footer onNavigate={(tab) => {
        navigate(tab === 'home' ? '/' : `/${tab}`);
      }} />

    </div>
  );
}
