import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Menu, 
  X, 
  ChevronDown, 
  AlertCircle, 
  Info,
  User,
  LogOut,
  Plus,
  Layers,
  Settings,
  LogIn,
  UserPlus
} from 'lucide-react';
import { clearAuthSession } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

export const Navbar = ({ 
  currentTab, 
  setCurrentTab, 
  activeRole, 
  setActiveRole, 
  currentUser,
  onLogout,
  onNavigate,
  onStartNewApplication,
  _onOpenAuth 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showDemoDisclaimerModal, setShowDemoDisclaimerModal] = useState(false);
  const userMenuRef = useRef(null);

  const { t } = useTranslation();

  const getLinkLabel = (linkId, fallback) => {
    switch (linkId) {
      case 'home': return t('nav.home', fallback);
      case 'industry-areas': return t('nav.industryAreas', fallback);
      case 'wizard': return t('nav.requirements', fallback);
      case 'compliance': return t('nav.compliance', fallback);
      case 'schemes': return t('nav.schemes', fallback);
      case 'help': return t('nav.help', fallback);
      case 'dashboard': return t('nav.dashboard', fallback);
      case 'my-applications': return t('nav.myApplications', fallback);
      case 'verification': return t('nav.verifyIdentity', fallback);
      case 'funding': return 'FundMatch';
      default: return fallback;
    }
  };

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLoggedIn = !!currentUser;

  // Navigation Links based on login state
  const unauthLinks = [
    { id: 'home', path: '/', label: 'Home' },
    { id: 'funding', path: '/funding', label: 'FundMatch' },
    { id: 'industry-areas', path: '/industry-areas', label: 'Industry Areas' },
    { id: 'wizard', path: '/wizard', label: 'Requirements' },
    { id: 'compliance', path: '/compliance', label: 'Compliance' },
    { id: 'schemes', path: '/schemes', label: 'Schemes' },
    { id: 'help', path: '/help', label: 'Help' }
  ];

  const authLinks = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard' },
    { id: 'my-applications', path: '/my-applications', label: 'My Applications' },
    { id: 'verification', path: '/verify', label: 'Verify Identity' },
    { id: 'funding', path: '/funding', label: 'FundMatch' },
    { id: 'industry-areas', path: '/industry-areas', label: 'Industry Areas' },
    { id: 'wizard', path: '/wizard', label: 'Requirements' },
    { id: 'compliance', path: '/compliance', label: 'Compliance' },
    { id: 'schemes', path: '/schemes', label: 'Schemes' }
  ];

  const navLinks = isLoggedIn ? authLinks : unauthLinks;

  const handleLinkClick = (item) => {
    if (onNavigate) {
      onNavigate(item.path);
    } else {
      setCurrentTab(item.id);
    }
    setMobileMenuOpen(false);
  };

  const handleLogoutAction = () => {
    setUserDropdownOpen(false);
    clearAuthSession();
    if (onLogout) {
      onLogout();
    } else if (onNavigate) {
      onNavigate('/login');
    }
  };

  const userInitial = (currentUser?.name || 'U').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      
      {/* Top Advisory Banner with MVP DEMO badge */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Clickable MVP DEMO Badge as requested in Rule 22 */}
            <button
              onClick={() => setShowDemoDisclaimerModal(true)}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-400 hover:bg-amber-300 text-slate-950 uppercase tracking-wide cursor-pointer transition-colors shadow-2xs"
              title="Click to view prototype notice"
            >
              <span>MVP DEMO</span>
              <Info className="w-3 h-3 text-slate-950" />
            </button>

            <span className="hidden md:inline text-slate-300">
              UdyamOne – Industrial Approval & Compliance Assistant • Smart India Hackathon Prototype
            </span>
            <span className="md:hidden text-slate-300">
              UdyamOne Assistant • Prototype
            </span>
          </div>

          <div className="flex items-center space-x-4 text-slate-300 text-xs">
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              {t('nav.assistanceTool', 'Assistance & Discovery Tool (Not a government portal)')}
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>

            {/* Language Selector Topbar */}
            <LanguageSelector variant="topbar" />

            <span className="text-slate-600 hidden sm:inline">|</span>
            
            {/* Demo Mode / Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors cursor-pointer"
                title="Switch view mode for demonstration"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{t('nav.mode', 'Mode')}: <strong className="text-amber-300">{activeRole === 'admin' ? t('nav.adminConsole', 'Admin Console') : activeRole === 'officer' ? t('nav.demoOfficerDesk', 'Demo Officer Desk') : t('nav.applicantView', 'Applicant View')}</strong></span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 animate-fadeIn"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-1 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('nav.demoSwitcher', 'Demonstration Mode Switcher')}
                  </div>
                  <button
                    onClick={() => {
                      setActiveRole('entrepreneur');
                      if (onNavigate) onNavigate(isLoggedIn ? '/dashboard' : '/');
                      else setCurrentTab('dashboard');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-50 ${activeRole === 'entrepreneur' ? 'bg-blue-50 text-brand-700 font-semibold' : ''}`}
                  >
                    <UserCheck className="w-4 h-4 text-brand-600" />
                    <div>
                      <div className="text-xs font-bold">Applicant Workspace</div>
                      <div className="text-[10px] text-slate-500">Track user-initiated applications</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole('admin');
                      if (onNavigate) onNavigate('/admin');
                      else setCurrentTab('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-50 ${activeRole === 'admin' ? 'bg-blue-50 text-brand-700 font-semibold' : ''}`}
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    <div>
                      <div className="text-xs font-bold">Admin Console</div>
                      <div className="text-[10px] text-slate-500">Identity verification monitoring</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRole('officer');
                      if (onNavigate) onNavigate('/officer');
                      else setCurrentTab('officer');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-50 ${activeRole === 'officer' ? 'bg-blue-50 text-brand-700 font-semibold' : ''}`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs font-bold">Demo Officer Review Desk</div>
                      <div className="text-[10px] text-slate-500">Simulate department action on user applications</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Emblem */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => handleLinkClick({ path: isLoggedIn ? '/dashboard' : '/', id: isLoggedIn ? 'dashboard' : 'home' })}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-900 via-brand-800 to-blue-600 flex items-center justify-center text-white shadow-md shadow-brand-900/15 ring-2 ring-blue-100">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Udyam<span className="text-brand-700">One</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-brand-800 border border-blue-200">
                  Assistant
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-tight hidden sm:block">
                Industrial Approval & Compliance Assistant
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentTab === link.id
                    ? 'text-brand-700 bg-brand-50/80 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {getLinkLabel(link.id, link.label)}
              </button>
            ))}

            {activeRole === 'admin' && (
              <button
                onClick={() => onNavigate ? onNavigate('/admin') : setCurrentTab('admin')}
                className="px-3.5 py-2 rounded-xl text-sm font-bold text-brand-800 hover:bg-blue-50"
              >
                {t('nav.admin', 'Admin')}
              </button>
            )}
            {activeRole === 'officer' && (
              <button
                onClick={() => onNavigate ? onNavigate('/officer') : setCurrentTab('officer')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                  currentTab === 'officer' ? 'text-amber-800 bg-amber-50 font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{t('nav.officerDesk', 'Officer Desk')}</span>
              </button>
            )}
          </nav>

          {/* Right Action: Authenticated vs Unauthenticated */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Language Selector Dropdown in Navbar */}
            <LanguageSelector />

            {isLoggedIn ? (
              <>
                {/* + New Application Button */}
                <button
                  onClick={() => onStartNewApplication ? onStartNewApplication() : (onNavigate && onNavigate('/application/new'))}
                  className="px-3.5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('nav.newApplication', '+ New Application')}</span>
                </button>

                {/* User Profile Menu with Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 pl-2.5 pr-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 transition-colors border border-slate-200 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {userInitial}
                    </div>
                    <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">
                      {currentUser?.name?.split(' ')[0] || 'Client'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {currentUser?.name || 'Enterprise Client'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {currentUser?.email || ''}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onNavigate) onNavigate('/profile');
                          else setCurrentTab('profile');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-brand-600" />
                        <span>{t('nav.myProfile', 'My Profile')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onNavigate) onNavigate('/my-applications');
                          else setCurrentTab('dashboard');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-brand-600" />
                        <span>{t('nav.myApplications', 'My Applications')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onNavigate) onNavigate('/verify');
                          else setCurrentTab('verification');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>{t('nav.verifyIdentity', 'Identity Verification')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (onNavigate) onNavigate('/profile');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>{t('nav.accountSettings', 'Account Settings')}</span>
                      </button>

                      <div className="my-1 border-t border-slate-100"></div>

                      <button
                        onClick={handleLogoutAction}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2.5 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>{t('nav.logOut', 'Log Out')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Unauthenticated: [Log In] and [Register] buttons */}
                <button
                  onClick={() => onNavigate ? onNavigate('/login') : (_onOpenAuth && _onOpenAuth('login'))}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-700 hover:bg-slate-100 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('nav.logIn', 'Log In')}</span>
                </button>

                <button
                  onClick={() => onNavigate ? onNavigate('/register') : (_onOpenAuth && _onOpenAuth('register'))}
                  className="px-4 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('nav.register', 'Register')}</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg animate-fadeIn">
          {/* Mobile Language Selector */}
          <LanguageSelector variant="mobile" />

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentTab === link.id
                  ? 'text-brand-700 bg-brand-50 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {getLinkLabel(link.id, link.label)}
            </button>
          ))}

          {isLoggedIn ? (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigate) onNavigate('/profile');
                  else setCurrentTab('profile');
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
              >
                <User className="w-4 h-4 text-brand-600" />
                <span>{t('nav.myProfile', 'My Profile')} ({currentUser?.name})</span>
              </button>
              <button
                onClick={handleLogoutAction}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>{t('nav.logOut', 'Log Out')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigate) onNavigate('/login');
                  else if (_onOpenAuth) _onOpenAuth('login');
                }}
                className="py-2.5 text-center rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                {t('nav.logIn', 'Log In')}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigate) onNavigate('/register');
                  else if (_onOpenAuth) _onOpenAuth('register');
                }}
                className="py-2.5 text-center rounded-xl bg-brand-700 text-xs font-bold text-white"
              >
                {t('nav.register', 'Register')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* MVP DEMO Notice Modal (Rule 22) */}
      {showDemoDisclaimerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-scaleUp relative">
            <button
              onClick={() => setShowDemoDisclaimerModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-black uppercase mb-1">
              MVP Prototype Notice
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              About UdyamOne MVP
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mt-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              This is a demonstration prototype created for the Smart India Hackathon. Government requirements and processes shown are based on statutory frameworks and should be verified with the relevant official authority before real-world use.
            </p>

            <div className="mt-4 text-[11px] text-slate-500 space-y-1">
              <div>✓ Single-Window Authentication & Application Workspace</div>
              <div>✓ Verified statutory authority references & Dependency Graph</div>
              <div>✓ Database Document Approval Verification</div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowDemoDisclaimerModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
