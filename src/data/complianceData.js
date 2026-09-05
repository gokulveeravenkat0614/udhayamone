// Compliance Data & Local Storage Handler
// Starts with NO fake pre-populated deadlines.
// Stores user-entered statutory compliance reminders in localStorage.

const STORAGE_KEY = "udyamone_user_compliance";

export const getStoredComplianceItems = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to read user compliance items from localStorage", e);
  }
  return []; // Initially empty as requested!
};

export const saveStoredComplianceItems = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save user compliance items to localStorage", e);
  }
};

// Verified reference calendar of statutory filing cycles (for educational reference only, not fake user deadlines)
export const STATUTORY_REFERENCE_CYCLES = [
  { 
    title: "Annual Factory Licence Renewal (Form 2)", 
    frequency: "Annual (typically before 31st October under State Factory Rules)", 
    authority: "Directorate of Industrial Safety & Health (DISH)",
    sourceUrl: "https://dish.maharashtra.gov.in"
  },
  { 
    title: "Environmental Statement (Form V)", 
    frequency: "Annual (mandated by 30th September under Environment Protection Rules)", 
    authority: "State Pollution Control Board (SPCB / MPCB)",
    sourceUrl: "https://mpcb.gov.in"
  },
  { 
    title: "Fire Safety Bi-Annual Maintenance Audit (Form B)", 
    frequency: "Half-Yearly (January and July under Fire Prevention Act)", 
    authority: "State Fire Services / PMRDA Fire Dept",
    sourceUrl: "https://mahafireservice.gov.in"
  },
  { 
    title: "Monthly GSTR-3B Summary Return", 
    frequency: "Monthly (20th of subsequent month)", 
    authority: "Goods and Services Tax Network (GSTN)",
    sourceUrl: "https://www.gst.gov.in"
  }
];

// Reference catalog of standard compliance items for statutory monitoring
export const COMPLIANCE_ITEMS = [
  {
    id: "comp-1",
    title: "Factory License Renewal (Form 2)",
    authority: "Directorate of Industrial Safety & Health (DISH)",
    dueDate: "31st October",
    frequency: "Annual",
    status: "Upcoming",
    description: "Annual renewal of factory operational license with safety verification"
  },
  {
    id: "comp-2",
    title: "Environmental Statement (Form V) Submission",
    authority: "State Pollution Control Board (MPCB / SPCB)",
    dueDate: "30th September",
    frequency: "Annual",
    status: "Upcoming",
    description: "Statutory environmental audit report for pollution compliance"
  },
  {
    id: "comp-3",
    title: "Fire Safety Bi-Annual Maintenance Audit (Form B)",
    authority: "State Fire Services",
    dueDate: "January & July",
    frequency: "Bi-Annual",
    status: "Upcoming",
    description: "Bi-annual inspection and maintenance certificate of fire systems"
  },
  {
    id: "comp-4",
    title: "Monthly GSTR-3B Summary Return",
    authority: "Goods and Services Tax Network (GSTN)",
    dueDate: "20th of every month",
    frequency: "Monthly",
    status: "Upcoming",
    description: "Self-assessed monthly summary return of outward and inward supplies"
  },
  {
    id: "comp-5",
    title: "Annual Hazardous Waste Return (Form 4)",
    authority: "State Pollution Control Board",
    dueDate: "30th June",
    frequency: "Annual",
    status: "Upcoming",
    description: "Annual return regarding hazardous waste generation and handling"
  },
  {
    id: "comp-6",
    title: "EPF & ESI Monthly Remittance",
    authority: "EPFO / ESIC",
    dueDate: "15th of every month",
    frequency: "Monthly",
    status: "Upcoming",
    description: "Monthly statutory employee provident fund and insurance deposits"
  }
];

export const COMPLIANCE_SUMMARY = {
  total: COMPLIANCE_ITEMS.length,
  upcoming: COMPLIANCE_ITEMS.filter(i => i.status === "Upcoming").length,
  completed: COMPLIANCE_ITEMS.filter(i => i.status === "Completed").length,
  overdue: 0
};

export const CALENDAR_EVENTS = [
  {
    id: "cal-1",
    title: "Monthly GSTR-3B Return Filing",
    date: "20th of every month",
    authority: "GSTN",
    category: "Taxation",
    mandatory: true
  },
  {
    id: "cal-2",
    title: "EPF & ESI Contribution Remittance",
    date: "15th of every month",
    authority: "EPFO / ESIC",
    category: "Labour",
    mandatory: true
  },
  {
    id: "cal-3",
    title: "Environmental Statement (Form V)",
    date: "30th September",
    authority: "State Pollution Control Board",
    category: "Environment",
    mandatory: true
  },
  {
    id: "cal-4",
    title: "Factory License Renewal (Form 2)",
    date: "31st October",
    authority: "DISH / Labour Department",
    category: "Industrial",
    mandatory: true
  },
  {
    id: "cal-5",
    title: "Fire Safety Bi-Annual Audit (Form B)",
    date: "31st January & 31st July",
    authority: "State Fire Services",
    category: "Safety",
    mandatory: true
  }
];

