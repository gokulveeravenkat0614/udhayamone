// Initial Applications Data & LocalStorage Store for UdyamOne Single-Window Portal

const STORAGE_KEY = "udyamone_user_applications_v2";

export const INITIAL_APPLICATIONS = [
  {
    id: "MH-10245",
    applicant: "ABC Manufacturing Pvt. Ltd.",
    promoter: "Vikramaditya Sharma",
    contactEmail: "contact@abcmfg.in",
    contactPhone: "+91 98201 44521",
    state: "Maharashtra",
    district: "Pune",
    location: "Plot No. 42, Sector 10, MIDC Bhosari, Pune, Maharashtra - 411026",
    industry: "Manufacturing",
    approval: "Factory / Industrial License",
    department: "Directorate of Industrial Safety & Health (DISH)",
    submissionDate: "2026-08-14",
    status: "Under Review",
    currentStageIndex: 2,
    requiredAction: "Department reviewing structural stability certificate & machinery layout",
    officerNotes: "Drawings verified by Junior Inspector. Forwarded to Joint Director for statutory inspection scheduling.",
    stages: [
      { name: "Application Submitted", date: "14 Aug 2026", done: true, remarks: "Dossier uploaded and e-challan acknowledged" },
      { name: "Document Verification", date: "18 Aug 2026", done: true, remarks: "Verified by DISH Pune Scrutiny Officer" },
      { name: "Department Review", date: "24 Aug 2026", done: true, remarks: "Technical assessment underway" },
      { name: "Site Inspection", date: "Scheduled 05 Sep 2026", done: false, active: true, remarks: "Inspector Shri S. K. Deshmukh assigned" },
      { name: "Approval & Grant of License", date: "Pending", done: false, remarks: "Digital Certificate release upon inspection report" }
    ],
    submittedDocs: [
      { name: "Building Layout / Site Plan", file: "factory_layout_plan_v2.pdf", status: "Verified" },
      { name: "Machinery Details & HP Rating", file: "machinery_power_schedule.pdf", status: "Verified" },
      { name: "Form 1 (Notice of Occupation)", file: "form_1_signed.pdf", status: "Verified" },
      { name: "Business Incorporation Certificate", file: "mca_incorporation_cert.pdf", status: "Verified" }
    ],
    certificateNumber: null
  },
  {
    id: "MH-10246",
    applicant: "ABC Manufacturing Pvt. Ltd.",
    promoter: "Vikramaditya Sharma",
    contactEmail: "contact@abcmfg.in",
    contactPhone: "+91 98201 44521",
    state: "Maharashtra",
    district: "Pune",
    location: "Plot No. 42, Sector 10, MIDC Bhosari, Pune, Maharashtra - 411026",
    industry: "Manufacturing",
    approval: "Pollution Control Consent (CTE / CTO)",
    department: "Maharashtra Pollution Control Board (MPCB)",
    submissionDate: "2026-07-20",
    status: "Approved",
    currentStageIndex: 4,
    requiredAction: "Clearance Granted. Download digitally signed consent certificate.",
    officerNotes: "ETP/APCS plans found conforming with Orange Category norms. CTE granted for 5 years.",
    stages: [
      { name: "Application Submitted", date: "20 Jul 2026", done: true, remarks: "Online application submitted on MPCB Portal" },
      { name: "Document Verification", date: "23 Jul 2026", done: true, remarks: "Environmental audit statement verified" },
      { name: "Department Review", date: "02 Aug 2026", done: true, remarks: "Reviewed by Regional Officer Pune" },
      { name: "Site Inspection", date: "09 Aug 2026", done: true, remarks: "Site visit completed without adverse remarks" },
      { name: "Approval & Grant of License", date: "16 Aug 2026", done: true, remarks: "Consent to Establish issued digitally" }
    ],
    submittedDocs: [
      { name: "Environmental Management Plan", file: "emp_mitigation_plan.pdf", status: "Approved" },
      { name: "Effluent Treatment Plant (ETP) Scheme", file: "etp_design_drawing.pdf", status: "Approved" },
      { name: "Land Ownership / Lease Agreement", file: "midc_lease_agreement.pdf", status: "Approved" }
    ],
    certificateNumber: "MPCB/CTE/PUN/2026/7821-X"
  },
  {
    id: "MH-10247",
    applicant: "ABC Manufacturing Pvt. Ltd.",
    promoter: "Vikramaditya Sharma",
    contactEmail: "contact@abcmfg.in",
    contactPhone: "+91 98201 44521",
    state: "Maharashtra",
    district: "Pune",
    location: "Plot No. 42, Sector 10, MIDC Bhosari, Pune, Maharashtra - 411026",
    industry: "Manufacturing",
    approval: "Fire Safety Approval / Provisional NOC",
    department: "Maharashtra Fire Services / PMRDA Fire Department",
    submissionDate: "2026-08-28",
    status: "Pending",
    currentStageIndex: 0,
    requiredAction: "Awaiting preliminary document validation by Chief Fire Officer",
    officerNotes: "Application received via single-window integration. Assigned to Fire Officer Desk 3.",
    stages: [
      { name: "Application Submitted", date: "28 Aug 2026", done: true, active: true, remarks: "Uploaded architectural drawings & hydrant specs" },
      { name: "Document Verification", date: "In Queue", done: false, remarks: "Fire prevention system specs verification" },
      { name: "Department Review", date: "Pending", done: false, remarks: "CFO scrutiny" },
      { name: "Site Inspection", date: "Pending", done: false, remarks: "On-site hydrant & sprinkler drill" },
      { name: "Approval & Grant of License", date: "Pending", done: false, remarks: "Provisional Fire NOC release" }
    ],
    submittedDocs: [
      { name: "Fire Hydrant & Sprinkler Drawing", file: "fire_evacuation_blueprint.pdf", status: "Uploaded" },
      { name: "Architectural Section Plans", file: "building_elevation_sections.pdf", status: "Uploaded" },
      { name: "Water Storage Tank Adequacy Certificate", file: "water_tank_cert.pdf", status: "Uploaded" }
    ],
    certificateNumber: null
  },
  {
    id: "MH-10248",
    applicant: "ABC Manufacturing Pvt. Ltd.",
    promoter: "Vikramaditya Sharma",
    contactEmail: "contact@abcmfg.in",
    contactPhone: "+91 98201 44521",
    state: "Maharashtra",
    district: "Pune",
    location: "Plot No. 42, Sector 10, MIDC Bhosari, Pune, Maharashtra - 411026",
    industry: "Manufacturing",
    approval: "Building / Local Authority Approval",
    department: "MIDC / Town Planning Authority",
    submissionDate: "2026-06-10",
    status: "Approved",
    currentStageIndex: 4,
    requiredAction: "Sanctioned building plan available for download.",
    officerNotes: "Floor Space Index (FSI) calculations and structural engineering stability certified.",
    stages: [
      { name: "Application Submitted", date: "10 Jun 2026", done: true, remarks: "Plans submitted via BPAMS" },
      { name: "Document Verification", date: "15 Jun 2026", done: true, remarks: "Ownership verified against MIDC 7/12" },
      { name: "Department Review", date: "22 Jun 2026", done: true, remarks: "Town Planner clearance granted" },
      { name: "Site Inspection", date: "28 Jun 2026", done: true, remarks: "Setbacks and approach road measured" },
      { name: "Approval & Grant of License", date: "05 Jul 2026", done: true, remarks: "Building Commencement Certificate issued" }
    ],
    submittedDocs: [
      { name: "Sanctioned Architectural Drawings", file: "sanctioned_architectural_plans.pdf", status: "Approved" },
      { name: "Structural Engineer Stability Certificate", file: "structural_stability_cert.pdf", status: "Approved" },
      { name: "MIDC Allotment Letter & Possession Receipt", file: "midc_possession_letter.pdf", status: "Approved" }
    ],
    certificateNumber: "MIDC/TP/BHO/2026/0419"
  },
  {
    id: "MH-10249",
    applicant: "ABC Manufacturing Pvt. Ltd.",
    promoter: "Vikramaditya Sharma",
    contactEmail: "contact@abcmfg.in",
    contactPhone: "+91 98201 44521",
    state: "Maharashtra",
    district: "Pune",
    location: "Plot No. 42, Sector 10, MIDC Bhosari, Pune, Maharashtra - 411026",
    industry: "Manufacturing",
    approval: "Electricity Connection Approval (HT/LT)",
    department: "MSEDCL (Maharashtra State Electricity Distribution Co. Ltd.)",
    submissionDate: "2026-08-19",
    status: "Under Review",
    currentStageIndex: 3,
    requiredAction: "Substation load feasibility inspection completed; estimate quotation being drafted",
    officerNotes: "Feasibility confirmed from 22kV Bhosari Substation. Consumer quotation under generation.",
    stages: [
      { name: "Application Submitted", date: "19 Aug 2026", done: true, remarks: "A1 Form submitted online" },
      { name: "Document Verification", date: "22 Aug 2026", done: true, remarks: "Connected load 250 kVA validated" },
      { name: "Department Review", date: "26 Aug 2026", done: true, remarks: "Technical sanction approved by Executive Engineer" },
      { name: "Site Inspection", date: "30 Aug 2026", done: true, remarks: "Transformer yard inspection completed" },
      { name: "Approval & Grant of License", date: "Pending", done: false, active: true, remarks: "Pending demand note payment receipt" }
    ],
    submittedDocs: [
      { name: "Electrical Wiring Blueprint & Single Line Diagram", file: "electrical_sld_250kva.pdf", status: "Verified" },
      { name: "Licensed Electrical Contractor Test Report", file: "contractor_test_report.pdf", status: "Verified" },
      { name: "Proof of Ownership / Lease Agreement", file: "premises_ownership_proof.pdf", status: "Verified" }
    ],
    certificateNumber: null
  }
];

export const getStoredApplications = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read user applications from localStorage", e);
  }
  return INITIAL_APPLICATIONS;
};

export const saveStoredApplications = (apps) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error("Failed to save user applications to localStorage", e);
  }
};

export const APPLICATION_WORKFLOW_STAGES = [
  "NOT STARTED",
  "DOCUMENTS READY",
  "READY TO APPLY",
  "APPLICATION SUBMITTED",
  "UNDER REVIEW",
  "APPROVED / REJECTED"
];

