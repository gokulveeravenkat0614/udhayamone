import React from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export const Footer = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1 & 2: Branding */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-700 to-blue-500 flex items-center justify-center text-white shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Udyam<span className="text-blue-400">One</span>
              </span>
            </div>

            <p className="text-sm text-slate-300 font-medium italic">
              {t('footer.tagline', '"One Platform. Every Approval. Every Compliance. Every Opportunity."')}
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footer.description', 'Simplifying end-to-end industrial clearances, statutory permissions, regulatory compliance monitoring, and government incentive schemes for Indian entrepreneurs.')}
            </p>

            {/* Smart India Hackathon Tag */}
            <div className="pt-2">
              <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold">
                <span>{t('footer.hackathonPrototype', 'Smart India Hackathon – MVP Prototype')}</span>
              </span>
            </div>
          </div>

          {/* Col 3: Clearances */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('footer.statutoryApprovals', 'Statutory Approvals')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#requirements-wizard" className="hover:text-white transition-colors">{t('footer.factoryLicense', 'Factory / Industrial License')}</a></li>
              <li><a href="#requirements-wizard" className="hover:text-white transition-colors">{t('footer.pollutionConsent', 'Pollution Consent (CFE / CTE / CTO)')}</a></li>
              <li><a href="#requirements-wizard" className="hover:text-white transition-colors">{t('footer.fireSafety', 'Fire Safety / Fire NOC Clearance')}</a></li>
              <li><a href="#requirements-wizard" className="hover:text-white transition-colors">{t('footer.buildingBlueprint', 'Building Blueprint & Sanction Approval')}</a></li>
              <li><a href="#requirements-wizard" className="hover:text-white transition-colors">{t('footer.powerSanction', 'Industrial Power Sanction (HT / LT)')}</a></li>
            </ul>
          </div>

          {/* Col 4: Quick Links */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('footer.platformLinks', 'Platform Links')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">{t('footer.aboutUdyamOne', 'About UdyamOne')}</button></li>
              <li><button onClick={() => onNavigate('wizard')} className="hover:text-white transition-colors">{t('footer.services', 'Services')}</button></li>
              <li><button onClick={() => onNavigate('compliance')} className="hover:text-white transition-colors">{t('footer.complianceCalendar', 'Compliance Calendar')}</button></li>
              <li><button onClick={() => onNavigate('schemes')} className="hover:text-white transition-colors">{t('footer.governmentSchemes', 'Government Schemes')}</button></li>
              <li><button onClick={() => onNavigate('help')} className="hover:text-white transition-colors">{t('footer.helpSupport', 'Help & Support')}</button></li>
            </ul>
          </div>

          {/* Col 5: Help & Emergency Contacts */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('footer.singleWindowHelpdesk', 'Single-Window Helpdesk')}
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>support@udyamone.gov.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1800-120-UDYAM (Toll Free)</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Udyam Bhavan, National Single-Window Cell</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500">
              {t('footer.workingHours', 'Working Hours: Mon – Sat, 9:30 AM to 6:00 PM IST')}
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            {t('footer.copyright', '© 2026 UdyamOne. Built for Smart India Hackathon. All rights reserved.')}
          </div>

          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacyPolicy', 'Privacy Policy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.termsOfService', 'Terms of Service')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.statutorySafeguards', 'Statutory Safeguards')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.helpContact', 'Help & Contact')}</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
