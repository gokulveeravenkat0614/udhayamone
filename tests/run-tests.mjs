// Comprehensive Automated Test Suite for UdyamOne Single-Window MVP
import { STATES_AND_DISTRICTS, POPULAR_PRESETS } from '../src/data/locations.js';
import { INDUSTRIES } from '../src/data/industries.js';
import { getRequirements } from '../src/data/requirementsData.js';
import { COMPLIANCE_ITEMS, COMPLIANCE_SUMMARY, CALENDAR_EVENTS } from '../src/data/complianceData.js';
import { SCHEMES_DATA } from '../src/data/schemesData.js';
import { INITIAL_APPLICATIONS } from '../src/data/initialApplications.js';

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, testName) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    errors.push(testName);
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

console.log("\n=======================================================");
console.log("🧪 RUNNING UDYAMONE SYSTEM & DATA VALIDATION TESTS");
console.log("=======================================================\n");

// TEST SUITE 1: LOCATIONS & DISTRICTS
console.log("▶ TEST SUITE 1: Locations & Dynamic District Mapping");
assert(STATES_AND_DISTRICTS["Maharashtra"] !== undefined, "Maharashtra exists in state catalog");
assert(STATES_AND_DISTRICTS["Maharashtra"].includes("Pune"), "Pune is available in Maharashtra districts");
assert(STATES_AND_DISTRICTS["Maharashtra"].length >= 19, `Maharashtra has detailed district options (${STATES_AND_DISTRICTS["Maharashtra"].length} found)`);
assert(STATES_AND_DISTRICTS["Karnataka"].includes("Bengaluru Urban"), "Karnataka includes Bengaluru Urban");
assert(STATES_AND_DISTRICTS["Gujarat"].includes("Ahmedabad"), "Gujarat includes Ahmedabad");
assert(STATES_AND_DISTRICTS["Tamil Nadu"].includes("Chennai"), "Tamil Nadu includes Chennai");
assert(POPULAR_PRESETS.length >= 4, `Popular presets configured (${POPULAR_PRESETS.length} presets)`);

// TEST SUITE 2: INDUSTRY CLASSIFICATIONS
console.log("\n▶ TEST SUITE 2: Industry Classifications");
assert(INDUSTRIES.length === 12, `All 12 required industry types present (${INDUSTRIES.length} found)`);
const industryIds = INDUSTRIES.map(i => i.id);
const requiredIndustries = [
  "Manufacturing", "Food Processing", "Textile & Garments", 
  "Information Technology", "Pharmaceutical", "Automobile", 
  "Chemical Industry", "Construction", "Electronics", 
  "Agriculture Processing", "Renewable Energy", "Other"
];
requiredIndustries.forEach(ind => {
  assert(industryIds.includes(ind), `Industry '${ind}' is defined with metadata`);
});

// TEST SUITE 3: PRIMARY MVP DEMO SCENARIO (Maharashtra > Pune > Manufacturing)
console.log("\n▶ TEST SUITE 3: Primary MVP Demo Scenario (Maharashtra > Pune > Manufacturing)");
const demoReqs = getRequirements("Maharashtra", "Pune", "Manufacturing");

assert(demoReqs.state === "Maharashtra", "Scenario state is Maharashtra");
assert(demoReqs.district === "Pune", "Scenario district is Pune");
assert(demoReqs.industry === "Manufacturing", "Scenario industry is Manufacturing");

// Summary counts
assert(demoReqs.summary.approvalsCount === 5, `Government Approvals count is exactly 5 (${demoReqs.summary.approvalsCount} found)`);
assert(demoReqs.summary.documentsCount === 9, `Required Documents count is exactly 9 (${demoReqs.summary.documentsCount} found)`);
assert(demoReqs.summary.otherRegistrationsCount === 3, `Other Registrations count is exactly 3 (${demoReqs.summary.otherRegistrationsCount} found)`);
assert(demoReqs.summary.readyDocumentsCount === 6, `Document readiness shows exactly '6 of 9 ready' (${demoReqs.summary.readyDocumentsCount} found)`);

// Required Approvals names check
const approvalNames = demoReqs.approvals.map(a => a.name);
assert(approvalNames.some(n => n.includes("Factory")), "Factory / Industrial License approval present");
assert(approvalNames.some(n => n.includes("Pollution")), "Pollution Control Consent approval present");
assert(approvalNames.some(n => n.includes("Fire")), "Fire Safety / Fire NOC approval present");
assert(approvalNames.some(n => n.includes("Building")), "Building / Local Authority Approval present");
assert(approvalNames.some(n => n.includes("Electricity")), "Electricity Connection Approval present");

// Department details check
const factoryApp = demoReqs.approvals.find(a => a.name.includes("Factory"));
assert(factoryApp.department.includes("DISH") || factoryApp.department.includes("Labour"), "Factory License maps to DISH / Labour Dept");
assert(factoryApp.stages.length === 4, "Factory License has detailed 4-stage procedural steps");
assert(factoryApp.renewalPeriod !== undefined, "Factory License specifies renewal information");

// Required 9 Documents check
const docNames = demoReqs.documents.map(d => d.name);
const expectedDocs = [
  "PAN Card / Business PAN",
  "Aadhaar / Identity Proof",
  "Business Registration Certificate",
  "Land Ownership / Lease Documents",
  "Building Layout / Site Plan",
  "Machinery Details",
  "Project Report",
  "Environmental Information",
  "Fire Safety Details"
];
expectedDocs.forEach(doc => {
  assert(docNames.includes(doc), `Required document '${doc}' present in checklist`);
});

// Next Steps Timeline check
assert(demoReqs.nextSteps.length === 5, `Next steps timeline has 5 chronological phases (${demoReqs.nextSteps.length} found)`);
assert(demoReqs.nextSteps[0].title.includes("Business Registration"), "Step 1 is Complete Business Registration");
assert(demoReqs.nextSteps[1].title.includes("Land & Building"), "Step 2 is Prepare Land & Building Documents");
assert(demoReqs.nextSteps[2].title.includes("Pollution Consent"), "Step 3 is Apply for Pollution Consent");
assert(demoReqs.nextSteps[3].title.includes("Factory License"), "Step 4 is Apply for Factory License");
assert(demoReqs.nextSteps[4].title.includes("Fire Safety"), "Step 5 is Obtain Fire Safety Approval");

// TEST SUITE 4: DYNAMIC SECTORAL ADAPTABILITY
console.log("\n▶ TEST SUITE 4: Sectoral Adaptability (Food, Pharma, Chemical, IT)");
const foodReqs = getRequirements("Maharashtra", "Pune", "Food Processing");
assert(foodReqs.approvals.some(a => a.name.includes("FSSAI")), "Food Processing includes FSSAI Manufacturing License");

const pharmaReqs = getRequirements("Maharashtra", "Thane", "Pharmaceutical");
assert(pharmaReqs.approvals.some(a => a.name.includes("Drug")), "Pharmaceutical includes Drug Manufacturing License");

const chemicalReqs = getRequirements("Gujarat", "Bharuch", "Chemical Industry");
assert(chemicalReqs.approvals.some(a => a.name.includes("PESO")), "Chemical Industry includes PESO Explosives License");

const itReqs = getRequirements("Karnataka", "Bengaluru Urban", "Information Technology");
assert(itReqs.approvals.some(a => a.name.includes("Shop") || a.name.includes("STPI")), "IT includes Shop & Est / STPI Registration");

// TEST SUITE 5: COMPLIANCE DASHBOARD
console.log("\n▶ TEST SUITE 5: Compliance Dashboard Data");
assert(COMPLIANCE_ITEMS.length >= 6, `Compliance items loaded (${COMPLIANCE_ITEMS.length} items)`);
assert(COMPLIANCE_ITEMS.some(i => i.title.includes("Factory License Renewal")), "Factory License Renewal item exists");
assert(COMPLIANCE_ITEMS.some(i => i.title.includes("Environmental Statement")), "Pollution Consent Form V item exists");
assert(CALENDAR_EVENTS.length >= 5, `Compliance calendar has statutory events (${CALENDAR_EVENTS.length} events)`);
assert(COMPLIANCE_SUMMARY.total >= 6, `Compliance summary total reflects items (${COMPLIANCE_SUMMARY.total} found)`);

// TEST SUITE 6: GOVERNMENT SCHEMES
console.log("\n▶ TEST SUITE 6: Government Schemes & Support");
assert(SCHEMES_DATA.length >= 6, `Schemes catalog has required categories (${SCHEMES_DATA.length} schemes)`);
const schemeCategories = SCHEMES_DATA.map(s => s.category);
["MSME Support", "Startup Support", "Technology Upgrade", "Employment Incentives", "Green Manufacturing", "Export Assistance"].forEach(cat => {
  assert(schemeCategories.includes(cat), `Support category '${cat}' exists`);
});

// TEST SUITE 7: INITIAL APPLICATIONS & 5-STAGE TRACKER
console.log("\n▶ TEST SUITE 7: Entrepreneur Dashboard & Application Tracker");
assert(INITIAL_APPLICATIONS.length >= 5, `At least 5 initial applications loaded (${INITIAL_APPLICATIONS.length} found)`);
const mh10245 = INITIAL_APPLICATIONS.find(a => a.id === "MH-10245");
assert(mh10245 !== undefined, "Sample application MH-10245 exists");
assert(mh10245.approval === "Factory / Industrial License", "MH-10245 is Factory License");
assert(mh10245.status === "Under Review", "MH-10245 status is Under Review");

const mh10246 = INITIAL_APPLICATIONS.find(a => a.id === "MH-10246");
assert(mh10246 !== undefined, "Sample application MH-10246 exists");
assert(mh10246.status === "Approved", "MH-10246 status is Approved");
assert(mh10246.certificateNumber !== null, "Approved MH-10246 has digital certificate number");

const mh10247 = INITIAL_APPLICATIONS.find(a => a.id === "MH-10247");
assert(mh10247 !== undefined, "Sample application MH-10247 exists");
assert(mh10247.status === "Pending", "MH-10247 status is Pending");

// Verify 5-stage tracker structure
assert(mh10245.stages.length === 5, "5-stage timeline present on application");
assert(mh10245.submittedDocs.length >= 3, "Submitted supporting documents attached");

console.log("\n=======================================================");
console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
if (failed === 0) {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! ZERO DEFECTS DETECTED.");
} else {
  console.error("⚠️ FAILED TESTS:", errors);
  process.exit(1);
}
console.log("=======================================================\n");
