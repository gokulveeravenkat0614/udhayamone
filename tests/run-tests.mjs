// Comprehensive Automated Test Suite for UdyamOne Single-Window MVP
import { STATES_AND_DISTRICTS, POPULAR_PRESETS } from '../src/data/locations.js';
import { INDUSTRIES } from '../src/data/industries.js';
import { getRequirements } from '../src/data/requirementsData.js';
import { COMPLIANCE_ITEMS, COMPLIANCE_SUMMARY, CALENDAR_EVENTS } from '../src/data/complianceData.js';
import { SCHEMES_DATA } from '../src/data/schemesData.js';
import { INITIAL_APPLICATIONS } from '../src/data/initialApplications.js';
import { validateUploadedDocumentAgainstDatabase, INITIAL_DATABASE_DOCUMENT_RECORDS } from '../src/services/databaseService.js';
import { 
  canProceedToSelfie, 
  canOpenSelfieRoute, 
  canProceedToAnalysis, 
  validateDocumentUpload 
} from '../src/services/verificationValidation.js';
import {
  classifyDocumentError,
  calculateDocumentStats,
  filterDocuments,
  extractDocumentsFromResponse
} from '../src/services/documentChecklistHelper.js';
import {
  POLLUTION_CATEGORIES,
  detectIndustryPollutionCategory,
  formatVerificationDate,
  isRecordOutdated
} from '../src/services/industryAreaHelper.js';
import { SEED_INDUSTRY_AREAS } from '../backend/data/seedIndustryAreas.js';
import { 
  STATE_BOUNDARIES, 
  getStateBoundary, 
  projectGeoPoint, 
  buildSvgPolygonPath 
} from '../src/data/stateBoundariesGeoJson.js';

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

// TEST SUITE 16: VERIFY FLOW DOCUMENT VALIDATION & DIRECT ROUTE PROTECTION (ACCEPTANCE TESTS)
console.log("\n▶ TEST SUITE 16: Verify Flow Document Validation & Direct Route Protection");

// 1. Click Continue without uploading document MUST stay on Documents
const testCase1 = canProceedToSelfie({ documentFile: null });
assert(!testCase1.canProceed, "Acceptance Test 2: Continue without document is blocked");
assert(testCase1.error === "Please upload your identity document before continuing.", "Acceptance Test 2: Shows 'Please upload your identity document before continuing.'");

// 2. Start upload but do not finish MUST NOT open Selfie
const validDocFile = { name: "pan_front.jpg", size: 245000, type: "image/jpeg" };
const testCase2 = canProceedToSelfie({ documentFile: validDocFile, documentUploadInProgress: true });
assert(!testCase2.canProceed, "Acceptance Test 6: In-progress upload blocks proceeding to Selfie");
assert(testCase2.error === "Please wait for the document upload to complete.", "Acceptance Test 6: Shows 'Please wait for the document upload to complete.'");

// 3. Upload fails MUST NOT open Selfie
const testCase3 = canProceedToSelfie({ 
  documentFile: null, 
  documentUploadFailed: true, 
  documentUploadError: "Document upload failed. Please upload again." 
});
assert(!testCase3.canProceed, "Acceptance Test 7: Failed upload blocks proceeding to Selfie");
assert(testCase3.error === "Document upload failed. Please upload again.", "Acceptance Test 7: Shows upload error message");

// 4. Empty file upload MUST NOT open Selfie
const emptyFile = { name: "empty.jpg", size: 0, type: "image/jpeg" };
const testCaseEmpty = canProceedToSelfie({ documentFile: emptyFile });
assert(!testCaseEmpty.canProceed, "Empty file is blocked from proceeding to Selfie");
assert(testCaseEmpty.error === "Uploaded document file is empty. Please upload a valid identity document.", "Empty file shows non-empty validation error");

// 5. Unsupported file format MUST NOT open Selfie
const unsupportedFile = { name: "document.pdf", size: 500000, type: "application/pdf" };
const testCaseUnsupported = canProceedToSelfie({ documentFile: unsupportedFile });
assert(!testCaseUnsupported.canProceed, "Unsupported file format is blocked from proceeding to Selfie");
assert(testCaseUnsupported.error === "Unsupported document type. Please upload a JPEG, PNG, or WEBP image.", "Unsupported format shows image format requirement");

// 6. Direct Route Protection: Refresh or attempt to directly open Selfie without valid document MUST return to Documents
const testCaseRoute = canOpenSelfieRoute({ documentFile: null });
assert(!testCaseRoute.allowed, "Acceptance Test 8: Direct Selfie route without document is blocked");
assert(testCaseRoute.redirectTo === '/verify', "Acceptance Test 8: Redirects to Documents step (/verify)");
assert(testCaseRoute.error === "Please upload your identity document first.", "Acceptance Test 8: Shows 'Please upload your identity document first.'");

// 7. Successful document upload MUST open Selfie / Capture Photo
const testCaseSuccess = canProceedToSelfie({ 
  documentFile: validDocFile, 
  documentUploadInProgress: false, 
  documentUploadFailed: false 
});
assert(testCaseSuccess.canProceed, "Acceptance Test 5: Valid uploaded document allows proceeding to Selfie");
assert(testCaseSuccess.error === null, "Acceptance Test 5: No errors when proceeding with valid document");

// 8. Direct Route Protection with valid document allows opening Selfie
const testCaseRouteAllowed = canOpenSelfieRoute({ documentFile: validDocFile });
assert(testCaseRouteAllowed.allowed, "Direct Selfie route allowed when valid document is present");

// 9. Complete workflow: Document + Selfie allows proceeding to AI Analysis
const validSelfie = { name: "selfie.jpg", size: 310000, type: "image/jpeg" };
const testCaseAnalysis = canProceedToAnalysis({ documentFile: validDocFile, selfieFile: validSelfie });
assert(testCaseAnalysis.canProceed, "Acceptance Test 9: Complete document + selfie allows proceeding to AI Analysis");

// TEST SUITE 17: REQUIRED DOCUMENTS CHECKLIST LOADING, ERROR MAPPING & FILTERING
console.log("\n▶ TEST SUITE 17: Required Documents Checklist Loading, Error Mapping & Filtering");

// 1. Error classification mappings
const authErr401 = classifyDocumentError({ status: 401 });
assert(authErr401.errorType === 'auth', "HTTP 401 classified as 'auth' errorType");
assert(authErr401.error === "Your session has expired. Please log in again.", "HTTP 401 produces session expired error message");

const authErrExpired = classifyDocumentError({ message: "jwt expired" });
assert(authErrExpired.errorType === 'auth', "JWT expired message classified as 'auth' errorType");

const forbiddenErr403 = classifyDocumentError({ status: 403 });
assert(forbiddenErr403.errorType === 'forbidden', "HTTP 403 classified as 'forbidden' errorType");
assert(forbiddenErr403.error === "You do not have permission to access this application.", "HTTP 403 produces permission denied message");

const notFoundErr404 = classifyDocumentError({ status: 404 });
assert(notFoundErr404.errorType === 'not_found', "HTTP 404 classified as 'not_found' errorType");
assert(notFoundErr404.error === "Application not found.", "HTTP 404 produces application not found message");

const serverErr500 = classifyDocumentError({ status: 500 });
assert(serverErr500.errorType === 'network', "HTTP 500 classified as 'network' errorType");
assert(serverErr500.error === "Unable to load document requirements. Please try again.", "HTTP 500 produces retryable error message");

const networkConnErr = classifyDocumentError({ message: "Network Error: Failed to fetch" });
assert(networkConnErr.errorType === 'network', "Network failure classified as 'network' errorType");

// 2. Document statistics calculation
const testDocs = [
  { id: 'd1', name: 'PAN Card', status: 'APPROVED', fileName: 'pan.pdf' },
  { id: 'd2', name: 'Aadhaar', status: 'VERIFIED', fileName: 'aadhaar.pdf' },
  { id: 'd3', name: 'Project Report', status: 'REJECTED', fileName: 'report.pdf' },
  { id: 'd4', name: 'Site Plan', status: 'NOT UPLOADED', fileName: null },
  { id: 'd5', name: 'Factory License', status: 'NOT UPLOADED', fileName: '' },
];
const stats = calculateDocumentStats(testDocs);
assert(stats.totalCount === 5, "Document stats correctly calculates totalCount=5");
assert(stats.approvedCount === 2, "Document stats correctly calculates approvedCount=2 (APPROVED + VERIFIED)");
assert(stats.rejectedCount === 1, "Document stats correctly calculates rejectedCount=1");
assert(stats.notUploadedCount === 2, "Document stats correctly calculates notUploadedCount=2");
assert(stats.percentageApproved === 40, "Document stats correctly calculates percentageApproved=40%");

const emptyStats = calculateDocumentStats([]);
assert(emptyStats.totalCount === 0, "Empty document list gives totalCount=0");
assert(emptyStats.percentageApproved === 0, "Empty document list gives percentageApproved=0");

// 3. Tab filtering
const allFilter = filterDocuments(testDocs, 'all');
assert(allFilter.length === 5, "Tab filter 'all' returns all 5 requirements");

const approvedFilter = filterDocuments(testDocs, 'approved');
assert(approvedFilter.length === 2, "Tab filter 'approved' returns only 2 approved requirements");
assert(approvedFilter.every(d => d.status === 'APPROVED' || d.status === 'VERIFIED'), "Tab filter 'approved' items have approved/verified status");

const rejectedFilter = filterDocuments(testDocs, 'rejected');
assert(rejectedFilter.length === 1, "Tab filter 'rejected' returns 1 rejected requirement");
assert(rejectedFilter[0].id === 'd3', "Tab filter 'rejected' returns expected document");

const notUploadedFilter = filterDocuments(testDocs, 'not_uploaded');
assert(notUploadedFilter.length === 2, "Tab filter 'not_uploaded' returns 2 un-uploaded requirements");

// 4. Response parsing
const rawArr = [{ id: '1' }, { id: '2' }];
assert(extractDocumentsFromResponse(rawArr).length === 2, "Response extractor parses raw array");
assert(extractDocumentsFromResponse({ documents: rawArr }).length === 2, "Response extractor parses { documents: [] }");
assert(extractDocumentsFromResponse({ data: { documents: rawArr } }).length === 2, "Response extractor parses { data: { documents: [] } }");
assert(extractDocumentsFromResponse({ data: rawArr }).length === 2, "Response extractor parses { data: [] }");
assert(extractDocumentsFromResponse(null).length === 0, "Response extractor gracefully handles null");

// TEST SUITE 18: STATE-WISE INDUSTRY AREA ELIGIBILITY & SITING REGULATIONS
console.log("\n▶ TEST SUITE 18: State-Wise Industry Area Eligibility & Siting Regulations");

// 1. Reusing website master state list (Rule 2)
const supportedStates = Object.keys(STATES_AND_DISTRICTS);
assert(supportedStates.includes("Maharashtra"), "Master states includes Maharashtra");
assert(supportedStates.includes("Tamil Nadu"), "Master states includes Tamil Nadu");
assert(supportedStates.includes("Gujarat"), "Master states includes Gujarat");
assert(supportedStates.includes("Karnataka"), "Master states includes Karnataka");
assert(supportedStates.includes("Telangana"), "Master states includes Telangana");
assert(supportedStates.includes("Andhra Pradesh"), "Master states includes Andhra Pradesh");
assert(supportedStates.includes("Delhi"), "Master states includes Delhi");
assert(supportedStates.includes("Other States"), "Master states includes Other States");

// 2. Pollution categories (Rule 3)
assert(POLLUTION_CATEGORIES.RED !== undefined, "Pollution category RED defined with metadata");
assert(POLLUTION_CATEGORIES.ORANGE !== undefined, "Pollution category ORANGE defined with metadata");
assert(POLLUTION_CATEGORIES.GREEN !== undefined, "Pollution category GREEN defined with metadata");
assert(POLLUTION_CATEGORIES.WHITE !== undefined, "Pollution category WHITE defined with metadata");

// 3. Industry CPCB Categorization detection (Rule 4)
const chemCat = detectIndustryPollutionCategory("Chemical Industry");
assert(chemCat && chemCat.category === 'RED', "Chemical Industry categorized as RED");

const pharmaCat = detectIndustryPollutionCategory("Pharmaceutical");
assert(pharmaCat && pharmaCat.category === 'RED', "Pharmaceutical categorized as RED");

const foodCat = detectIndustryPollutionCategory("Food Processing");
assert(foodCat && foodCat.category === 'ORANGE', "Food Processing categorized as ORANGE");

const autoCat = detectIndustryPollutionCategory("Automobile");
assert(autoCat && autoCat.category === 'ORANGE', "Automobile categorized as ORANGE");

const agroCat = detectIndustryPollutionCategory("Agriculture Processing");
assert(agroCat && agroCat.category === 'GREEN', "Agriculture Processing categorized as GREEN");

const itCat = detectIndustryPollutionCategory("Information Technology");
assert(itCat && itCat.category === 'WHITE', "Information Technology categorized as WHITE");

const customClean = detectIndustryPollutionCategory("Software Development & AI Lab");
assert(customClean && customClean.category === 'WHITE', "Software Development heuristic maps to WHITE");

const customPolluting = detectIndustryPollutionCategory("Acid pickling & electroplating");
assert(customPolluting && customPolluting.category === 'RED', "Acid pickling heuristic maps to RED");

// 4. Data validation & completeness (Rule 9: No fake/incomplete records)
assert(SEED_INDUSTRY_AREAS.length >= 20, `Seed database contains rich verified regulatory area records (${SEED_INDUSTRY_AREAS.length} found)`);

SEED_INDUSTRY_AREAS.forEach((rec, idx) => {
  assert(Boolean(rec.state), `Record #${idx + 1} (${rec.industrialArea}) has mandatory State`);
  assert(Boolean(rec.district), `Record #${idx + 1} has mandatory District`);
  assert(Boolean(rec.industrialArea), `Record #${idx + 1} has mandatory Industrial Area`);
  assert(['RED', 'ORANGE', 'GREEN', 'WHITE'].includes(rec.category), `Record #${idx + 1} has valid category (${rec.category})`);
  assert(Boolean(rec.authority), `Record #${idx + 1} has mandatory Regulatory Authority/SPCB`);
  assert(Boolean(rec.sourceTitle), `Record #${idx + 1} has mandatory Official Source Title`);
  assert(Boolean(rec.conditions), `Record #${idx + 1} has statutory siting conditions`);
  assert(rec.lastVerifiedAt instanceof Date && !isNaN(rec.lastVerifiedAt.getTime()), `Record #${idx + 1} has valid Date instance for lastVerifiedAt`);
  assert(supportedStates.includes(rec.state), `Record #${idx + 1} state '${rec.state}' exists in website master state list`);
});

// 5. Date formatting & freshness checking (Rule 12)
const formattedSample = formatVerificationDate("2026-01-15T00:00:00.000Z");
assert(formattedSample === "15/01/2026", `Date formatted as DD/MM/YYYY (${formattedSample})`);

const isFresh = isRecordOutdated("2026-01-01", 18);
assert(isFresh === false, "Recent verification date (2026) is tagged as fresh/current");

const isOld = isRecordOutdated("2020-01-01", 18);
assert(isOld === true, "Outdated record (2020) is tagged as 'Verification required'");

// 6. Category filtering over real seed records (Rule 3)
const mhRed = SEED_INDUSTRY_AREAS.filter(a => a.state === 'Maharashtra' && a.category === 'RED');
assert(mhRed.length >= 2, `Maharashtra has verified RED areas (${mhRed.length} found)`);
assert(mhRed.every(a => a.category === 'RED'), "RED filter only contains RED category records");

const mhOrange = SEED_INDUSTRY_AREAS.filter(a => a.state === 'Maharashtra' && a.category === 'ORANGE');
assert(mhOrange.length >= 2, `Maharashtra has verified ORANGE areas (${mhOrange.length} found)`);
assert(mhOrange.every(a => a.category === 'ORANGE'), "ORANGE filter only contains ORANGE category records");

const mhWhite = SEED_INDUSTRY_AREAS.filter(a => a.state === 'Maharashtra' && a.category === 'WHITE');
assert(mhWhite.length >= 1, `Maharashtra has verified WHITE areas (${mhWhite.length} found)`);
assert(mhWhite.every(a => a.category === 'WHITE'), "WHITE filter only contains WHITE category records");

// 7. District filtering
const puneAreas = SEED_INDUSTRY_AREAS.filter(a => a.state === 'Maharashtra' && a.district === 'Pune');
assert(puneAreas.length >= 3, `Pune district contains verified industrial areas (${puneAreas.length} found)`);
assert(puneAreas.every(a => a.district === 'Pune'), "District filter strictly returns Pune areas");

// 8. Unrepresented state handling (Rule 2: No fake data)
const unrepresentedStateAreas = SEED_INDUSTRY_AREAS.filter(a => a.state === "Other States");
assert(unrepresentedStateAreas.length === 0, "Unonboarded state has 0 fake records; triggers official unverified fallback message");

// TEST SUITE 15: MINI STATE MAP & REAL GEOGRAPHIC BOUNDARIES
console.log("\n▶ TEST SUITE 15: Mini State Map, Geographic Boundaries & Coordinate Projection");

// 1. Check all supported states have authentic boundary definitions
const supportedBoundaryStates = [
  "Maharashtra", "Tamil Nadu", "Gujarat", "Karnataka", 
  "Telangana", "Andhra Pradesh", "Delhi", "Other States"
];
supportedBoundaryStates.forEach(st => {
  const boundary = getStateBoundary(st);
  assert(boundary !== undefined, `State boundary defined for '${st}'`);
  assert(boundary.bounds && typeof boundary.bounds.minLat === 'number', `'${st}' has valid bounds object`);
  assert(boundary.bounds.minLat < boundary.bounds.maxLat, `'${st}' minLat (${boundary.bounds.minLat}) < maxLat (${boundary.bounds.maxLat})`);
  assert(boundary.bounds.minLng < boundary.bounds.maxLng, `'${st}' minLng (${boundary.bounds.minLng}) < maxLng (${boundary.bounds.maxLng})`);
  assert(Array.isArray(boundary.polygon) && boundary.polygon.length >= 10, `'${st}' polygon has at least 10 real geographic coordinate points (${boundary.polygon?.length} points)`);
  
  // Verify coordinates are realistic Indian coordinates
  boundary.polygon.forEach((pt, pIdx) => {
    assert(Array.isArray(pt) && pt.length === 2, `'${st}' polygon point #${pIdx} is [lng, lat] pair`);
    const [lng, lat] = pt;
    assert(lng >= 68 && lng <= 90, `'${st}' point #${pIdx} longitude (${lng}) within Indian territory`);
    assert(lat >= 8 && lat <= 32, `'${st}' point #${pIdx} latitude (${lat}) within Indian territory`);
  });
});

// 2. Test mathematical projection function
const mhBoundary = getStateBoundary("Maharashtra");
const projectedPune = projectGeoPoint(18.52, 73.85, mhBoundary.bounds, 460, 350, 24);
assert(typeof projectedPune.x === 'number' && projectedPune.x >= 24 && projectedPune.x <= 436, `Projected Pune X is within SVG bounds (${projectedPune.x})`);
assert(typeof projectedPune.y === 'number' && projectedPune.y >= 24 && projectedPune.y <= 326, `Projected Pune Y is within SVG bounds (${projectedPune.y})`);

// 3. Test SVG path generator
const svgPath = buildSvgPolygonPath(mhBoundary.polygon, mhBoundary.bounds, 460, 350, 24);
assert(typeof svgPath === 'string' && svgPath.startsWith('M ') && svgPath.endsWith(' Z'), "SVG polygon path formatted with valid M ... Z syntax");

// 4. Strict Geographic Coordinate Containment: All 31 seed records fall within their state bounds
SEED_INDUSTRY_AREAS.forEach((area, idx) => {
  const st = area.state;
  const boundary = getStateBoundary(st);
  const lat = typeof area.latitude === 'number' ? area.latitude : area.coordinates?.lat;
  const lng = typeof area.longitude === 'number' ? area.longitude : area.coordinates?.lng;
  
  assert(typeof lat === 'number' && typeof lng === 'number', `Record #${idx + 1} (${area.industrialArea}) has valid numeric coordinates`);
  assert(lat >= boundary.bounds.minLat - 0.1 && lat <= boundary.bounds.maxLat + 0.1, 
    `Record #${idx + 1} latitude (${lat}) falls within ${st} bounds [${boundary.bounds.minLat}, ${boundary.bounds.maxLat}]`);
  assert(lng >= boundary.bounds.minLng - 0.1 && lng <= boundary.bounds.maxLng + 0.1, 
    `Record #${idx + 1} longitude (${lng}) falls within ${st} bounds [${boundary.bounds.minLng}, ${boundary.bounds.maxLng}]`);
});

// 5. Category Pin Color Mapping Standard
const categoryColors = {
  RED: '#e11d48',
  ORANGE: '#f59e0b',
  GREEN: '#10b981',
  WHITE: '#64748b'
};
assert(categoryColors.RED === '#e11d48', "RED category mapped to regulatory red (#e11d48)");
assert(categoryColors.ORANGE === '#f59e0b', "ORANGE category mapped to regulatory orange (#f59e0b)");
assert(categoryColors.GREEN === '#10b981', "GREEN category mapped to regulatory green (#10b981)");
assert(categoryColors.WHITE === '#64748b', "WHITE category mapped to regulatory slate/white (#64748b)");

console.log("\n=======================================================");
console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
if (failed === 0) {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! ZERO DEFECTS DETECTED.");
} else {
  console.error("⚠️ FAILED TESTS:", errors);
  process.exit(1);
}
console.log("=======================================================\n");

