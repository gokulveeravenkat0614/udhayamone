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
      { name: "Building Layout / Site Plan", file: "dish_layout_drawing.pdf", status: "Verified" },
      { name: "Machinery Details & HP Rating", file: "machinery_power_schedule.pdf", status: "Verified" },
      { name: "Form 1 (Notice of Occupation)", file: "form_1_signed.pdf", status: "Verified" }
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
    submittedDocs: [],
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
    submittedDocs: [],
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
    submittedDocs: [],
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
    submittedDocs: [],
    certificateNumber: null
  },
  {
    id: "TG-10250",
    applicant: "Telangana Precision Engineering Pvt. Ltd.",
    promoter: "K. V. Rao",
    contactEmail: "contact@tgprecision.in",
    contactPhone: "+91 94401 23456",
    state: "Telangana",
    district: "Medchal-Malkajgiri",
    location: "Plot No. 88, TSIIC Industrial Park, Genome Valley, Medchal-Malkajgiri, Telangana - 500078",
    industry: "Manufacturing",
    approval: "Factory / Industrial License",
    department: "Department of Factories, Government of Telangana",
    submissionDate: "2026-08-15",
    status: "Under Review",
    currentStageIndex: 2,
    requiredAction: "Department reviewing machinery safety layout & structural stability certificate under Telangana Factories Rules",
    officerNotes: "Drawings verified by Inspector of Factories Medchal circle. Forwarded for joint inspection.",
    stages: [
      { name: "Application Submitted", date: "15 Aug 2026", done: true, remarks: "Dossier uploaded via TS-iPASS single-window" },
      { name: "Document Verification", date: "19 Aug 2026", done: true, remarks: "Verified by Department of Factories Scrutiny Officer" },
      { name: "Department Review", date: "25 Aug 2026", done: true, remarks: "Technical scrutiny in progress" },
      { name: "Site Inspection", date: "Scheduled 08 Sep 2026", done: false, active: true, remarks: "Inspector of Factories assigned" },
      { name: "Approval & Grant of License", date: "Pending", done: false, remarks: "Digital Certificate release upon inspection report" }
    ],
    submittedDocs: [
      { name: "Building Layout / Site Plan", file: "tg_factory_layout.pdf", status: "Verified" },
      { name: "Machinery Details & HP Rating", file: "machinery_load_schedule.pdf", status: "Verified" },
      { name: "Form 1 (Notice of Occupation)", file: "tg_form_1.pdf", status: "Verified" }
    ],
    certificateNumber: null
  },
  {
    id: "TG-10251",
    applicant: "Telangana Precision Engineering Pvt. Ltd.",
    promoter: "K. V. Rao",
    contactEmail: "contact@tgprecision.in",
    contactPhone: "+91 94401 23456",
    state: "Telangana",
    district: "Medchal-Malkajgiri",
    location: "Plot No. 88, TSIIC Industrial Park, Genome Valley, Medchal-Malkajgiri, Telangana - 500078",
    industry: "Manufacturing",
    approval: "Pollution Control Consent (CFE / CFO)",
    department: "Telangana State Pollution Control Board (TSPCB)",
    submissionDate: "2026-07-22",
    status: "Approved",
    currentStageIndex: 4,
    requiredAction: "Clearance Granted. Download digitally signed CFE certificate.",
    officerNotes: "Orange category consent granted under TS-iPASS deemed approval provisions.",
    stages: [
      { name: "Application Submitted", date: "22 Jul 2026", done: true, remarks: "Online application submitted via TS-iPASS / TSPCB OCMMS" },
      { name: "Document Verification", date: "25 Jul 2026", done: true, remarks: "Environmental audit and ETP drawings verified" },
      { name: "Department Review", date: "04 Aug 2026", done: true, remarks: "TSPCB Regional Officer scrutiny complete" },
      { name: "Site Inspection", date: "11 Aug 2026", done: true, remarks: "Site inspection satisfactory" },
      { name: "Approval & Grant of License", date: "18 Aug 2026", done: true, remarks: "CFE Order issued digitally via TS-iPASS" }
    ],
    submittedDocs: [],
    certificateNumber: "TSPCB/CFE/RO-MDL/2026/4102-C"
  }
];

export const getInitialApplicationsForState = (state = 'Maharashtra') => {
  return INITIAL_APPLICATIONS.filter(app => !app.state || app.state === state);
};

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

