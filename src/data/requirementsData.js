// Verified Requirements Database & Engine Interface for UdyamOne Industrial Approval Assistant
// Strictly based on published statutory frameworks from Central and State authorities.

import {
  evaluateEligibilityAndDependencies,
  calculateMSMEClassification,
  calculatePollutionCategory,
  getMasterApprovalCatalog,
  normalizeBusinessProfile,
  buildDependencyGraph
} from '../services/ruleEngine.js';

export const REQUIREMENT_CATEGORIES = [
  "All Categories",
  "Business Registration",
  "Tax / Registration",
  "Land & Building",
  "Factory / Labour",
  "Environment",
  "Fire & Safety",
  "Electricity / Utilities",
  "Industry-Specific Approvals",
  "Ongoing Compliance",
  "Government Schemes"
];

/**
 * Returns evaluated approvals, conditional exemptions, dependency graph,
 * documents checklist, and recommended sequence for the specified location & business profile.
 */
export const getRequirements = (
  state = "Maharashtra",
  district = "Pune",
  industry = "Manufacturing",
  businessProfile = {},
  userApplications = []
) => {
  return evaluateEligibilityAndDependencies({
    state,
    district,
    industry,
    ...businessProfile
  }, userApplications);
};

export {
  calculateMSMEClassification,
  calculatePollutionCategory,
  getMasterApprovalCatalog,
  normalizeBusinessProfile,
  buildDependencyGraph
};
