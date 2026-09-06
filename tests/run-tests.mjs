// Comprehensive Automated Test Suite for UdyamOne Single-Window MVP
import { STATES_AND_DISTRICTS, POPULAR_PRESETS } from '../src/data/locations.js';
import { INDUSTRIES } from '../src/data/industries.js';
import { getRequirements } from '../src/data/requirementsData.js';
import { COMPLIANCE_ITEMS, COMPLIANCE_SUMMARY, CALENDAR_EVENTS } from '../src/data/complianceData.js';
import { SCHEMES_DATA } from '../src/data/schemesData.js';
import { INITIAL_APPLICATIONS } from '../src/data/initialApplications.js';
import { validateUploadedDocumentAgainstDatabase, INITIAL_DATABASE_DOCUMENT_RECORDS } from '../src/services/databaseService.js';

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
assert(demoReqs.summary.readyDocumentsCount === 0, `Initial required documents start with 0 uploaded records (${demoReqs.summary.readyDocumentsCount} found)`);

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

// TEST SUITE 8: STATUTORY ELIGIBILITY & CONDITIONAL RULES ENGINE
console.log("\n▶ TEST SUITE 8: Statutory Eligibility & Conditional Rules Engine");
// Scenario: Worker count < 10 with power (conditionally exempt from Factories Act)
const smallWorkersReqs = getRequirements("Maharashtra", "Pune", "Manufacturing", {
  employeeCount: 6,
  powerRequired: 15
});
assert(smallWorkersReqs.approvals.some(a => a.name.includes("Shop & Establishment")), "Worker count < 10 routes to Shop & Establishment Registration");
assert(smallWorkersReqs.exemptApprovals.some(a => a.name.includes("Factory")), "Factories Act marked as Conditionally Exempt for < 10 workers");
const factoryExemption = smallWorkersReqs.exemptApprovals.find(a => a.name.includes("Factory"));
assert(factoryExemption.exemptionReason.includes("below the statutory threshold"), "Exemption reason explains 10-worker threshold");

// Scenario: Chemical with Hazardous Materials triggers PESO
const hazardousReqs = getRequirements("Maharashtra", "Pune", "Manufacturing", {
  usesHazardousChemicals: true
});
assert(hazardousReqs.approvals.some(a => a.name.includes("PESO")), "Hazardous chemicals declaration triggers PESO Explosives License");

// Scenario: MSME Classification
assert(demoReqs.msmeClassification.category === "Small", "₹2.5 Cr investment / ₹12 Cr turnover is Small Enterprise");
const microReqs = getRequirements("Maharashtra", "Pune", "Manufacturing", {
  investment: 0.5,
  turnover: 2.0
});
assert(microReqs.msmeClassification.category === "Micro", "₹0.5 Cr / ₹2 Cr is Micro Enterprise");

// Scenario: Pollution Classification
assert(demoReqs.pollutionClassification.category === "Orange", "General Manufacturing is Orange Pollution Category");
assert(itReqs.pollutionClassification.category === "White", "IT Sector is White Pollution Category (Exempt from CTE/CTO)");

// TEST SUITE 9: APPROVAL DEPENDENCY GRAPH & RECOMMENDED JOURNEY
console.log("\n▶ TEST SUITE 9: Approval Dependency Graph & Recommended Journey");
assert(demoReqs.dependencyGraph !== undefined, "Dependency Graph generated for requirements");
assert(demoReqs.dependencyGraph.nodes.length === 5, `Dependency graph has 5 nodes for default demo (${demoReqs.dependencyGraph.nodes.length} found)`);
assert(demoReqs.dependencyGraph.edges.length > 0, `Dependency graph has directed prerequisite edges (${demoReqs.dependencyGraph.edges.length} edges)`);
assert(demoReqs.dependencyGraph.phases.length >= 3, `Dependency graph organized in chronological phases (${demoReqs.dependencyGraph.phases.length} phases)`);

// Check prerequisite resolution
const factoryNode = demoReqs.dependencyGraph.nodes.find(n => n.id === "app-factory");
assert(factoryNode !== undefined, "Factory License node exists in dependency graph");
assert(factoryNode.prerequisites.length >= 2, "Factory License has prerequisites (building, fire, pollution, electricity)");
assert(factoryNode.phase === 4, "Factory License placed in Phase 4 (Pre-Operation)");

const buildingNode = demoReqs.dependencyGraph.nodes.find(n => n.id === "app-building");
assert(buildingNode !== undefined, "Building approval node exists in dependency graph");
assert(buildingNode.phase === 2, "Building approval placed in Phase 2 (Pre-Establishment)");

// TEST SUITE 10: DOCUMENT APPROVAL LOGIC (MVP CORE RULES)
console.log("\n▶ TEST SUITE 10: Document Approval Logic & Database Verification");
assert(INITIAL_DATABASE_DOCUMENT_RECORDS.length === 6, `Database contains 6 registered statutory document records (${INITIAL_DATABASE_DOCUMENT_RECORDS.length} found)`);

// 1. Matching database record -> APPROVED
const approvedPan = await validateUploadedDocumentAgainstDatabase({
  documentId: 'doc-pan',
  documentType: 'PAN Card / Business PAN'
});
assert(approvedPan.recordExists === true, "Database record exists for 'doc-pan'");
assert(approvedPan.status === 'APPROVED', "Document with matching database record is marked APPROVED");
assert(approvedPan.badge === 'APPROVED', "Status badge for matching database record is APPROVED");

const approvedReg = await validateUploadedDocumentAgainstDatabase({
  documentId: 'doc-reg',
  documentType: 'Business Registration Certificate'
});
assert(approvedReg.recordExists === true, "Database record exists for 'doc-reg'");
assert(approvedReg.status === 'APPROVED', "Document 'doc-reg' status is APPROVED");
assert(approvedReg.badge === 'APPROVED', "Status badge for 'doc-reg' is APPROVED");

// 2. Missing database record -> REJECTED
const rejectedProject = await validateUploadedDocumentAgainstDatabase({
  documentId: 'doc-project',
  documentType: 'Project Report'
});
assert(rejectedProject.recordExists === false, "Database record does NOT exist for 'doc-project'");
assert(rejectedProject.status === 'REJECTED', "Document WITHOUT matching database record is marked REJECTED");
assert(rejectedProject.badge === 'REJECTED', "Status badge for missing database record is REJECTED");

const rejectedFire = await validateUploadedDocumentAgainstDatabase({
  documentId: 'doc-fire',
  documentType: 'Fire Safety Details'
});
assert(rejectedFire.recordExists === false, "Database record does NOT exist for 'doc-fire'");
assert(rejectedFire.status === 'REJECTED', "Document 'doc-fire' status is REJECTED");
assert(rejectedFire.badge === 'REJECTED', "Status badge for 'doc-fire' is REJECTED");

// 3. Core Rule: Never mark document as APPROVED only because user uploaded file
const arbitraryUpload = await validateUploadedDocumentAgainstDatabase({
  documentId: 'doc-arbitrary-upload',
  documentType: 'Custom Uploaded Blueprint',
  fileName: 'my_uploaded_drawing.pdf',
  fileSize: '4.2 MB'
});
assert(arbitraryUpload.recordExists === false, "Arbitrary uploaded file does not match database record");
assert(arbitraryUpload.status === 'REJECTED', "Core Rule Enforced: Uploaded file without DB record is marked REJECTED (never marked APPROVED just because file was uploaded)");
assert(arbitraryUpload.badge === 'REJECTED', "Badge is REJECTED");

// 4. Document Card Attribute Verification
demoReqs.documents.forEach(doc => {
  assert(typeof doc.name === 'string' && doc.name.length > 0, `Card shows Document name for '${doc.id}'`);
  assert(typeof doc.category === 'string' && doc.category.length > 0, `Card shows Category for '${doc.id}'`);
  assert(typeof doc.whyRequired === 'string' && doc.whyRequired.length > 0, `Card shows Why required for '${doc.id}'`);
  assert(doc.status === 'APPROVED' || doc.status === 'REJECTED' || doc.status === 'NOT UPLOADED', `Card shows Current status for '${doc.id}' (${doc.status})`);
  if (doc.status === 'APPROVED') {
    assert(doc.fileName !== null, `Card shows File name for approved '${doc.id}'`);
    assert(doc.fileSize !== null, `Card shows File size for approved '${doc.id}'`);
  }
});

// TEST SUITE 11: NAVIGATION FLOW - DIRECT LANDING ON REQUIRED APPROVALS LIST
console.log("\n▶ TEST SUITE 11: Navigation Flow & Approvals Landing Verification");
import fs from 'fs';
import { getStatutoryReferenceCycles, getComplianceItems } from '../src/data/complianceData.js';
const appJsxContent = fs.readFileSync('src/App.jsx', 'utf-8');
const reqViewContent = fs.readFileSync('src/components/RequirementsView.jsx', 'utf-8');
const businessFormContent = fs.readFileSync('src/components/BusinessForm.jsx', 'utf-8');

assert(businessFormContent.includes("Find Required Approvals & Sequence"), "BusinessForm contains submit action 'Find Required Approvals & Sequence'");
assert(reqViewContent.includes('id="required-approvals-section"'), "RequirementsView contains target anchor 'required-approvals-section'");
assert(appJsxContent.includes('required-approvals-section'), "App.jsx handleFindApprovals scrolls directly to 'required-approvals-section'");
assert(reqViewContent.includes('Required Government Approvals, Licenses & NOCs'), "RequirementsView has prominent section heading for required government approvals");
assert(!appJsxContent.includes("window.scrollTo({ top: 380"), "Bug fixed: Hardcoded top: 380 scroll landing on Eligibility Dashboard removed");

// TEST SUITE 12: TELANGANA STATE DATA INTEGRITY & ZERO MAHARASHTRA LEAKAGE
console.log("\n▶ TEST SUITE 12: Telangana State Data Integrity & Zero Maharashtra Leakage");
assert(STATES_AND_DISTRICTS["Telangana"] !== undefined, "Telangana exists in state catalog");
assert(STATES_AND_DISTRICTS["Telangana"].length === 33, `Telangana has all 33 official districts (${STATES_AND_DISTRICTS["Telangana"].length} found)`);
const sampleTgDistricts = ["Hyderabad", "Medchal-Malkajgiri", "Rangareddy", "Sangareddy", "Warangal", "Karimnagar", "Nalgonda", "Bhadradri Kothagudem", "Nizamabad"];
sampleTgDistricts.forEach(d => {
  assert(STATES_AND_DISTRICTS["Telangana"].includes(d), `Telangana district '${d}' present`);
});

const tgHydReqs = getRequirements("Telangana", "Hyderabad", "Manufacturing");
assert(tgHydReqs.state === "Telangana", "Scenario state is Telangana");
assert(tgHydReqs.district === "Hyderabad", "Scenario district is Hyderabad");

const bannedMhKeywords = ["Maharashtra", "MPCB", "DISH", "PMRDA", "MSEDCL", "MIDC Bhosari"];
tgHydReqs.approvals.forEach(app => {
  bannedMhKeywords.forEach(keyword => {
    assert(!app.department.includes(keyword), `Approval '${app.name}' department does NOT contain '${keyword}'`);
    assert(!app.authority.includes(keyword), `Approval '${app.name}' authority does NOT contain '${keyword}'`);
    assert(!app.officialSource.includes("Maharashtra"), `Approval '${app.name}' officialSource does NOT mention Maharashtra`);
  });
});

const tgPollution = tgHydReqs.approvals.find(a => a.id === 'app-pollution');
assert(tgPollution.department.includes("TSPCB") || tgPollution.department.includes("Telangana State Pollution Control Board"), "Telangana Pollution approval maps to TSPCB");

const tgFactory = tgHydReqs.approvals.find(a => a.id === 'app-factory');
assert(tgFactory.department.includes("Department of Factories") && tgFactory.department.includes("Telangana"), "Telangana Factory License maps to Department of Factories, Telangana");

const tgFire = tgHydReqs.approvals.find(a => a.id === 'app-fire');
assert(tgFire.department.includes("TS-Fire") || tgFire.department.includes("Telangana State Disaster Response"), "Telangana Fire Safety maps to TS-Fire");

const tgBuilding = tgHydReqs.approvals.find(a => a.id === 'app-building');
assert(tgBuilding.department.includes("HMDA") && tgBuilding.department.includes("TS-bPASS"), "Hyderabad Building Approval maps to HMDA / TS-bPASS / TSIIC");

const tgPower = tgHydReqs.approvals.find(a => a.id === 'app-electricity');
assert(tgPower.department.includes("TGSPDCL") || tgPower.department.includes("Southern Power Distribution"), "Hyderabad Power maps to TGSPDCL");

const tgWarangalReqs = getRequirements("Telangana", "Warangal", "Manufacturing");
const tgWarangalPower = tgWarangalReqs.approvals.find(a => a.id === 'app-electricity');
assert(tgWarangalPower.department.includes("TGNPDCL") || tgWarangalPower.department.includes("Northern Power Distribution"), "Warangal Power maps to Northern DISCOM (TGNPDCL)");
const tgWarangalBuilding = tgWarangalReqs.approvals.find(a => a.id === 'app-building');
assert(tgWarangalBuilding.department.includes("DTCP"), "Warangal Building maps to DTCP / TS-bPASS");

assert(!tgHydReqs.nextSteps[3].title.includes("DISH"), "Telangana next steps step 4 title does NOT contain DISH");
assert(tgHydReqs.nextSteps[3].agency.includes("Department of Factories"), "Telangana next steps step 4 agency is Department of Factories");
assert(tgHydReqs.nextSteps[2].agency.includes("TSPCB"), "Telangana next steps step 3 agency is TSPCB");

const tgCycles = getStatutoryReferenceCycles("Telangana");
tgCycles.forEach(c => {
  bannedMhKeywords.forEach(keyword => {
    assert(!c.authority.includes(keyword), `Statutory cycle '${c.title}' authority does NOT contain '${keyword}'`);
  });
});
assert(tgCycles.some(c => c.authority.includes("TSPCB")), "Telangana statutory cycles include TSPCB");
assert(tgCycles.some(c => c.authority.includes("Department of Factories")), "Telangana statutory cycles include Department of Factories, Telangana");

const tgItems = getComplianceItems("Telangana");
tgItems.forEach(item => {
  bannedMhKeywords.forEach(keyword => {
    assert(!item.authority.includes(keyword), `Compliance item '${item.title}' authority does NOT contain '${keyword}'`);
  });
});

console.log("\n=======================================================");
console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
if (failed === 0) {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! ZERO DEFECTS DETECTED.");
} else {
  console.error("⚠️ FAILED TESTS:", errors);
  process.exit(1);
}
console.log("=======================================================\n");

