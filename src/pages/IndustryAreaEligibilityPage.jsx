import React from 'react';
import { IndustryAreaEligibility } from '../components/IndustryAreaEligibility';

export const IndustryAreaEligibilityPage = ({
  onNavigate,
  selectedState = 'Maharashtra',
  selectedDistrict = 'All',
  selectedIndustry = ''
}) => {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <IndustryAreaEligibility
        initialState={selectedState}
        initialDistrict={selectedDistrict}
        onNavigate={onNavigate}
      />
    </div>
  );
};
