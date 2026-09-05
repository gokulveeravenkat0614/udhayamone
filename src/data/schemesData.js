// Government Support Schemes Reference Database for UdyamOne Assistant
// Clearly labeled as Demonstration / Statutory Reference Data.
// Status defaults to "Check Eligibility" rather than claiming fake pre-eligibility.

export const SCHEMES_DATA = [
  {
    id: "scheme-cgtmse",
    name: "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
    department: "Ministry of Micro, Small and Medium Enterprises (MSME)",
    purpose: "Facilitates collateral-free bank credit up to ₹5 Crore for eligible micro and small manufacturing units.",
    eligibility: "New and existing Micro and Small Enterprises in manufacturing or service sectors with project viability.",
    officialSource: "CGTMSE Scheme Guidelines, Ministry of MSME",
    officialLink: "https://www.cgtmse.in",
    status: "Check Eligibility",
    category: "MSME Support",
    tags: ["Collateral-Free", "Bank Credit", "MSME"]
  },
  {
    id: "scheme-startup",
    name: "Startup India Seed Fund Scheme & DPIIT Recognition",
    department: "Department for Promotion of Industry and Internal Trade (DPIIT)",
    purpose: "Provides financial assistance to startups for proof of concept, prototype development, product trials, and market entry.",
    eligibility: "DPIIT-recognized startups incorporated not more than 2 years ago with an innovative business concept.",
    officialSource: "Startup India Portal, DPIIT, Ministry of Commerce & Industry",
    officialLink: "https://www.startupindia.gov.in",
    status: "Check Eligibility",
    category: "Startup Support",
    tags: ["Seed Capital", "Incubator Support", "Innovation"]
  },
  {
    id: "scheme-clcss",
    name: "Credit Linked Capital Subsidy Component (MSME Champions)",
    department: "Ministry of Micro, Small and Medium Enterprises (MSME)",
    purpose: "Provides capital subsidy for modernizing plant and machinery with state-of-the-art technology.",
    eligibility: "Eligible registered MSME manufacturing units undertaking approved technological upgrades.",
    officialSource: "Champions Scheme Guidelines, Ministry of MSME",
    officialLink: "https://msme.gov.in",
    status: "Check Eligibility",
    category: "Technology Upgrade",
    tags: ["Technology Upgradation", "Capital Subsidy", "Manufacturing"]
  },
  {
    id: "scheme-pmrpy",
    name: "Aatmanirbhar Bharat Rojgar Yojana / Formal Employment Support",
    department: "Ministry of Labour and Employment",
    purpose: "Incentivizes employers for creation of new employment through statutory social security support.",
    eligibility: "Establishments registered with EPFO adding new employees within statutory wage ceilings.",
    officialSource: "Employees' Provident Fund Organisation (EPFO)",
    officialLink: "https://www.epfindia.gov.in",
    status: "Check Eligibility",
    category: "Employment Incentives",
    tags: ["EPFO Contribution", "Wage Support", "Employment"]
  },
  {
    id: "scheme-zed",
    name: "MSME Sustainable (ZED) Certification Scheme",
    department: "Ministry of MSME & Quality Council of India (QCI)",
    purpose: "Provides financial support for Zero Defect Zero Effect (ZED) certification to promote environmental and quality compliance.",
    eligibility: "Manufacturing MSMEs with active Udyam registration.",
    officialSource: "ZED Portal, Ministry of MSME",
    officialLink: "https://zed.msme.gov.in",
    status: "Check Eligibility",
    category: "Green Manufacturing",
    tags: ["Quality Audit", "Environmental Standards", "Green MSME"]
  },
  {
    id: "scheme-export",
    name: "Market Access Initiative (MAI) Scheme",
    department: "Department of Commerce, Ministry of Commerce & Industry",
    purpose: "Assists exporters with overseas statutory quality certifications, testing fees, and export market development.",
    eligibility: "Direct manufacturing exporters, export promotion councils, and recognized industrial associations.",
    officialSource: "Department of Commerce, Govt of India",
    officialLink: "https://commerce.gov.in",
    status: "Check Eligibility",
    category: "Export Assistance",
    tags: ["Global Markets", "Testing Subsidies", "Export Compliance"]
  }
];
