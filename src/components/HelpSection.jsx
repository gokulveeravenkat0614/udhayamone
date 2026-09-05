import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare
} from 'lucide-react';

export const HelpSection = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "What is UdyamOne?",
      a: "UdyamOne is a centralized single-window industrial approval and compliance platform created to solve the problem of fragmented registrations, permissions, licenses, and NOCs across multiple central, state, and local departments. It provides entrepreneurs with personalized requirement matrices based on their state, district, and sector."
    },
    {
      q: "How does UdyamOne determine applicable approvals?",
      a: "By mapping statutory thresholds under the Factories Act, State Pollution Control Board guidelines (Red/Orange/Green/White categorization), National Building Code, Fire Safety norms, and DISCOM electrical regulations according to your selected state, district, and industrial activity."
    },
    {
      q: "Can I track applications across different departments?",
      a: "Yes! UdyamOne's 5-stage Application Tracker standardizes milestones (Application Submitted → Document Verification → Department Review → Inspection → Approval) across disparate government portals so you have real-time visibility in one dashboard."
    },
    {
      q: "Are the approval requirements legally binding for this prototype?",
      a: "The requirements generated in this MVP prototype are indicative representative demonstrations designed for the Smart India Hackathon. Actual statutory applicability varies with gross capital investment, land zoning, and specific notification amendments."
    },
    {
      q: "How does the Government Officer portal interact with the applicant?",
      a: "Department officers can examine submitted documents, review machinery parameters, request clarifications, schedule site inspections, and issue digital provisional clearances. Any action taken by the officer immediately updates the entrepreneur's dashboard in real-time."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 animate-fadeIn">
      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-brand-800 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Help & Knowledge Base
        </h2>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Common queries regarding single-window industrial clearances, statutory safeguards, and compliance monitoring.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div 
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full p-5 text-left font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-brand-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Card */}
      <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-700 text-white flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Need specific regulatory assistance?</h4>
            <p className="text-xs text-slate-600">Our single-window industrial facilitators are available to guide you.</p>
          </div>
        </div>
        <a
          href="mailto:support@udyamone.gov.in"
          className="px-5 py-2.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-md transition-all shrink-0"
        >
          Contact Helpdesk
        </a>
      </div>

    </div>
  );
};
