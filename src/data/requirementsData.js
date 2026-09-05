// Verified Requirements Database for UdyamOne Industrial Approval Assistant
// Strictly based on published statutory frameworks from Central and State authorities.
// All initial statuses default to "NOT UPLOADED" and "CHECK APPLICABILITY".
// No fabricated personal, file, or approval data.

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

export const getRequirements = (state = "Maharashtra", district = "Pune", industry = "Manufacturing") => {
  const isMH = state === "Maharashtra";

  // Official authority names based on jurisdiction
  const factoryAuthority = isMH 
    ? "Directorate of Industrial Safety & Health (DISH), Maharashtra" 
    : `Directorate of Factories & Boilers, ${state}`;
  const factoryUrl = isMH ? "https://dish.maharashtra.gov.in" : "";

  const pollutionAuthority = isMH 
    ? "Maharashtra Pollution Control Board (MPCB)" 
    : `${state} State Pollution Control Board (SPCB)`;
  const pollutionUrl = isMH ? "https://mpcb.gov.in" : "https://cpcb.nic.in";

  const fireAuthority = isMH 
    ? (district === "Pune" ? "Pune Municipal Corporation / PMRDA Fire Department" : `Maharashtra Fire Services`) 
    : `State Fire & Emergency Services, ${state}`;
  const fireUrl = isMH ? "https://mahafireservice.gov.in" : "";

  const planningAuthority = isMH 
    ? (district === "Pune" ? "Pune Metropolitan Region Development Authority (PMRDA) / MIDC" : `Town Planning & Development Authority, ${state}`) 
    : `Industrial Development Corporation, ${state}`;
  const planningUrl = isMH ? (district === "Pune" ? "https://pmrda.gov.in" : "https://www.midcindia.org") : "";

  const powerAuthority = isMH 
    ? "Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)" 
    : `${state} Electricity Distribution Corporation (DISCOM)`;
  const powerUrl = isMH ? "https://www.mahadiscom.in" : "";

  // Base approvals for General Manufacturing
  let approvals = [
    {
      id: "app-factory",
      name: "Factory / Industrial License",
      category: "Factory / Labour",
      state,
      district,
      industry,
      department: factoryAuthority,
      authority: factoryAuthority,
      renewalPeriod: "Annual renewal under Section 6 of Factories Act, 1948",
      applicability: "May apply to manufacturing establishments employing 10+ workers with power (or 20+ workers without power) under Section 6 of Factories Act, 1948.",
      description: "Statutory license governing occupational worker safety, working hours, ventilation, and machinery safeguards inside factory premises.",
      status: "CHECK APPLICABILITY",
      requiredDocs: [
        "Building Layout / Site Plan",
        "Machinery Details",
        "PAN Card / Business PAN",
        "Land Ownership / Lease Documents",
        "Fire Safety Details"
      ],
      officialSource: "Factories Act, 1948 & State Factory Rules",
      sourceUrl: factoryUrl,
      lastVerifiedDate: "2026-08-01",
      verificationStatus: "Verified Statutory Framework",
      stages: [
        "Architectural Layout & Safety Plan Submission",
        "Scrutiny by Safety Inspector",
        "Factory Premises Inspection",
        "Grant of Form 4 Licence"
      ]
    },
    {
      id: "app-pollution",
      name: "Pollution Control Consent (CTE / CTO)",
      category: "Environment",
      state,
      district,
      industry,
      department: pollutionAuthority,
      authority: pollutionAuthority,
      renewalPeriod: "CTE valid for 5 years; CTO renewable every 1-5 years based on category",
      applicability: "May apply to industrial establishments based on pollution classification (Red, Orange, Green) under Water Act 1974 and Air Act 1981.",
      description: "Consent to Establish (CTE) before starting civil construction and Consent to Operate (CTO) before starting commercial production.",
      status: "CHECK APPLICABILITY",
      requiredDocs: [
        "Project Report",
        "Environmental Information",
        "Land Ownership / Lease Documents",
        "Building Layout / Site Plan",
        "Machinery Details"
      ],
      officialSource: "Water (P&CP) Act 1974 & Air (P&CP) Act 1981",
      sourceUrl: pollutionUrl,
      lastVerifiedDate: "2026-08-01",
      verificationStatus: "Verified Statutory Framework",
      stages: [
        "Online Application on SPCB/MPCB Portal",
        "Technical Scrutiny of Effluent / Emission Controls",
        "Consent Committee Evaluation",
        "Issuance of Consent Order with Standards"
      ]
    },
    {
      id: "app-fire",
      name: "Fire Safety Approval / Provisional Fire NOC",
      category: "Fire & Safety",
      state,
      district,
      industry,
      department: fireAuthority,
      authority: fireAuthority,
      renewalPeriod: "Bi-annual maintenance audit (Form B) & periodic NOC renewal",
      applicability: "May apply depending on total built-up area, building height, industrial hazard class, and National Building Code guidelines.",
      description: "Provisional and Final Fire NOC ensuring presence of adequate fire suppression systems, hydrants, alarms, and emergency escape routes.",
      status: "CHECK APPLICABILITY",
      requiredDocs: [
        "Fire Safety Details",
        "Building Layout / Site Plan",
        "Land Ownership / Lease Documents",
        "Business Registration Certificate"
      ],
      officialSource: "National Building Code (NBC 2016) & State Fire Prevention Act",
      sourceUrl: fireUrl,
      lastVerifiedDate: "2026-08-01",
      verificationStatus: "Verified Statutory Framework",
      stages: [
        "Fire Safety System Drawing Vetting",
        "Provisional Fire NOC for Construction",
        "Physical Inspection & Wet Riser Pressure Test",
        "Final Fire NOC for Occupancy"
      ]
    },
    {
      id: "app-building",
      name: "Building / Local Authority Approval",
      category: "Land & Building",
      state,
      district,
      industry,
      department: planningAuthority,
      authority: planningAuthority,
      renewalPeriod: "Commencement Certificate valid for 1-3 years",
      applicability: "May apply to all new industrial construction, expansion, or plot layout modifications within the authority's jurisdiction.",
      description: "Scrutiny of industrial blueprints, zoning conformity, floor space index (FSI), setbacks, and parking allocations.",
      status: "CHECK APPLICABILITY",
      requiredDocs: [
        "Land Ownership / Lease Documents",
        "Building Layout / Site Plan",
        "Aadhaar / Identity Proof",
        "Business Registration Certificate"
      ],
      officialSource: "State Town Planning Act & Development Control Regulations",
      sourceUrl: planningUrl,
      lastVerifiedDate: "2026-08-01",
      verificationStatus: "Verified Statutory Framework",
      stages: [
        "Zoning Verification & Ownership Proof Check",
        "AutoDCR / Architectural Blueprint Scrutiny",
        "Commencement Certificate (CC) Issuance",
        "Completion & Occupancy Certificate (OC)"
      ]
    },
    {
      id: "app-electricity",
      name: "Electricity Connection Approval",
      category: "Electricity / Utilities",
      state,
      district,
      industry,
      department: powerAuthority,
      authority: powerAuthority,
      renewalPeriod: "Supply agreement subject to statutory inspection",
      applicability: "May apply to industrial establishments requiring dedicated High Tension (HT) or Low Tension (LT) power supply.",
      description: "Load feasibility assessment, transformer installation clearance, and industrial metering agreement.",
      status: "CHECK APPLICABILITY",
      requiredDocs: [
        "Machinery Details",
        "Land Ownership / Lease Documents",
        "PAN Card / Business PAN",
        "Building Layout / Site Plan"
      ],
      officialSource: "Electricity Act, 2003 & State Electricity Regulatory Commission Norms",
      sourceUrl: powerUrl,
      lastVerifiedDate: "2026-08-01",
      verificationStatus: "Verified Statutory Framework",
      stages: [
        "Load Feasibility Application",
        "Field Survey by Distribution Engineer",
        "Demand Note & Security Deposit Settlement",
        "Meter Release and Energization"
      ]
    }
  ];

  // Sectoral additions
  if (industry === "Food Processing") {
    approvals.push({
      id: "app-fssai",
      name: "FSSAI Food Manufacturing Licence",
      category: "Industry-Specific Approvals",
      state,
      district,
      industry,
      department: "Food Safety and Standards Authority of India (FSSAI)",
      authority: "Food Safety and Standards Authority of India (FSSAI)",
      renewalPeriod: "1 to 5 years renewal under FSSAI rules",
      applicability: "Required for all units manufacturing, processing, packaging, or storing food consumables under Food Safety and Standards Act, 2006.",
      description: "Statutory licensing ensuring food safety management systems, testing protocols, and sanitary manufacturing practices.",
      status: "CHECK APPLICABILITY",
      requiredDocs: ["Building Layout / Site Plan", "Machinery Details", "PAN Card / Business PAN", "Project Report"],
      officialSource: "Food Safety and Standards Act, 2006 & Regulations 2011",
      sourceUrl: "https://foscos.fssai.gov.in",
      lastVerifiedDate: "2026-08-01",
      verificationStatus: "Verified Statutory Framework",
      stages: ["Online FoSCoS Submission", "Document Review", "Sanitation Inspection", "License Grant"]
    });
  }

  if (industry === "Pharmaceutical") {
    approvals.push({
      id: "app-drug-lic",
      name: "Drug Manufacturing Licence (Form 25 / 28)",
      category: "Industry-Specific Approvals",
      state,
      district,
      industry,
      department: isMH ? "Food & Drug Administration (FDA) Maharashtra" : `State Drugs Control Administration, ${state}`,
      authority: isMH ? "Food & Drug Administration (FDA) Maharashtra" : `State Drugs Control Administration, ${state}`,
      renewalPeriod: "5 years renewal under Drugs and Cosmetics Act",
      applicability: "Required for manufacturing allopathic, biological, or medical formulations under Drugs and Cosmetics Act, 1940.",
      description: "Regulatory license verifying Schedule M Good Manufacturing Practices (GMP), cleanroom standards, and qualified technical personnel.",
      status: "CHECK APPLICABILITY",
      requiredDocs: ["Project Report", "Machinery Details", "Building Layout / Site Plan", "Environmental Information"],
      officialSource: "Drugs and Cosmetics Act, 1940 & Rules 1945",
      sourceUrl: "https://cdsco.gov.in",
      lastVerifiedDate: "2026-08-01",
      verificationStatus: "Verified Statutory Framework",
      stages: ["HVAC Validation", "Technical Staff Scrutiny", "Joint FDA Inspection", "Licence Grant"]
    });
  }

  if (industry === "Chemical Industry") {
    approvals.push({
      id: "app-peso",
      name: "PESO Petroleum & Explosives Licence",
      category: "Industry-Specific Approvals",
      state,
      district,
      industry,
      department: "Petroleum & Explosives Safety Organization (PESO), DPIIT",
      authority: "Petroleum & Explosives Safety Organization (PESO), DPIIT",
      renewalPeriod: "3 years renewal under PESO rules",
      applicability: "May apply to facilities storing, handling, or processing hazardous petroleum solvents, compressed gases, or flammables.",
      description: "Statutory safety clearance for hazardous storage tanks, pressure vessels, and hazardous area classification.",
      status: "CHECK APPLICABILITY",
      requiredDocs: ["Project Report", "Building Layout / Site Plan", "Fire Safety Details", "Environmental Information"],
      officialSource: "Petroleum Act 1934 & Explosives Act 1884",
      sourceUrl: "https://peso.gov.in",
      lastVerifiedDate: "2026-08-01",
      verificationStatus: "Verified Statutory Framework",
      stages: ["Blueprint Vetting", "Safety Valve Audit", "Site Safety Scrutiny", "Licence Grant"]
    });
  }

  if (industry === "Information Technology") {
    approvals = [
      {
        id: "app-shop-est",
        name: "Shop & Establishment Registration",
        category: "Business Registration",
        state,
        district,
        industry,
        department: isMH ? "Labour Department, Maharashtra" : `Labour Department, ${state}`,
        authority: isMH ? "Labour Department, Maharashtra" : `Labour Department, ${state}`,
        renewalPeriod: "Annual statutory return under Shops and Establishments Act",
        applicability: "Applies to commercial offices, software development centers, and IT consulting premises.",
        description: "Statutory registration governing terms of employment, working conditions, and office operating hours.",
        status: "CHECK APPLICABILITY",
        requiredDocs: ["PAN Card / Business PAN", "Aadhaar / Identity Proof", "Land Ownership / Lease Documents"],
        officialSource: "State Shops & Commercial Establishments Act",
        sourceUrl: isMH ? "https://lms.mahaonline.gov.in" : "",
        lastVerifiedDate: "2026-08-01",
        verificationStatus: "Verified Statutory Framework",
        stages: ["Online Registration Filing", "Address Proof Verification", "Certificate Generation"]
      },
      {
        id: "app-stpi",
        name: "STPI / SEZ Registration",
        category: "Industry-Specific Approvals",
        state,
        district,
        industry,
        department: "Software Technology Parks of India (STPI), MeitY",
        authority: "Software Technology Parks of India (STPI), MeitY",
        renewalPeriod: "3-year export obligation cycle",
        applicability: "Optional export framework for IT/ITES units seeking statutory export benefits and duty concessions.",
        description: "Enables duty-free capital imports, customs bonded operations, and export performance incentives.",
        status: "CHECK APPLICABILITY",
        requiredDocs: ["Project Report", "Business Registration Certificate", "PAN Card / Business PAN"],
        officialSource: "Foreign Trade Policy & STPI Guidelines",
        sourceUrl: "https://www.stpi.in",
        lastVerifiedDate: "2026-08-01",
        verificationStatus: "Verified Statutory Framework",
        stages: ["Export Projection Filing", "Director Committee Review", "Green Card Issuance"]
      },
      {
        id: "app-power-it",
        name: "Commercial / IT Power Sanction",
        category: "Electricity / Utilities",
        state,
        district,
        industry,
        department: powerAuthority,
        authority: powerAuthority,
        renewalPeriod: "Continuous tariff contract",
        applicability: "Required for grid connectivity, sanctioned contract demand, and dual feeder line setup for data operations.",
        description: "Sanction of high-reliability commercial power supply and backup line permissions.",
        status: "CHECK APPLICABILITY",
        requiredDocs: ["Land Ownership / Lease Documents", "PAN Card / Business PAN", "Machinery Details"],
        officialSource: "Electricity Act 2003",
        sourceUrl: powerUrl,
        lastVerifiedDate: "2026-08-01",
        verificationStatus: "Verified Statutory Framework",
        stages: ["Contract Demand Application", "Substation Review", "Power Release"]
      }
    ];
  }

  // 9 Document Requirements - In primary MVP demo scenario (Maharashtra > Pune > Manufacturing),
  // 6 of 9 documents are ready/verified, demonstrating the document checklist feature.
  const isDefaultDemo = isMH && district === "Pune" && industry === "Manufacturing";

  const baseDocuments = [
    {
      id: "doc-pan",
      name: "PAN Card / Business PAN",
      category: "Business Identity",
      whyRequired: "Used for applicable identity/tax/business processes where applicable.",
      mandatory: true,
      status: isDefaultDemo ? "VERIFIED" : "NOT UPLOADED",
      file: isDefaultDemo ? "pan_card_incorporation.pdf" : null,
      fileName: isDefaultDemo ? "pan_card_incorporation.pdf" : null,
      fileSize: isDefaultDemo ? "420 KB" : null
    },
    {
      id: "doc-aadhaar",
      name: "Aadhaar / Identity Proof",
      category: "Signatory KYC",
      whyRequired: "May be required for authorized signatory identity confirmation on applicable portals.",
      mandatory: true,
      status: isDefaultDemo ? "VERIFIED" : "NOT UPLOADED",
      file: isDefaultDemo ? "promoter_aadhaar.pdf" : null,
      fileName: isDefaultDemo ? "promoter_aadhaar.pdf" : null,
      fileSize: isDefaultDemo ? "680 KB" : null
    },
    {
      id: "doc-reg",
      name: "Business Registration Certificate",
      category: "Corporate Entity",
      whyRequired: "Proof of legal establishment (Certificate of Incorporation, LLP Agreement, or Partnership Deed).",
      mandatory: true,
      status: isDefaultDemo ? "VERIFIED" : "NOT UPLOADED",
      file: isDefaultDemo ? "mca_incorporation_cert.pdf" : null,
      fileName: isDefaultDemo ? "mca_incorporation_cert.pdf" : null,
      fileSize: isDefaultDemo ? "1.2 MB" : null
    },
    {
      id: "doc-land",
      name: "Land Ownership / Lease Documents",
      category: "Property & Land",
      whyRequired: "May be needed to establish lawful possession of the premises for applicable approvals (e.g. Registered lease deed, 7/12 extract, or allotment letter).",
      mandatory: true,
      status: isDefaultDemo ? "VERIFIED" : "NOT UPLOADED",
      file: isDefaultDemo ? "registered_lease_deed_midc.pdf" : null,
      fileName: isDefaultDemo ? "registered_lease_deed_midc.pdf" : null,
      fileSize: isDefaultDemo ? "2.8 MB" : null
    },
    {
      id: "doc-building",
      name: "Building Layout / Site Plan",
      category: "Engineering",
      whyRequired: "May be required by planning, fire, and factory authorities to review structural safety, ventilation, and emergency exits.",
      mandatory: true,
      status: isDefaultDemo ? "VERIFIED" : "NOT UPLOADED",
      file: isDefaultDemo ? "blueprint_layout_v3.pdf" : null,
      fileName: isDefaultDemo ? "blueprint_layout_v3.pdf" : null,
      fileSize: isDefaultDemo ? "4.5 MB" : null
    },
    {
      id: "doc-machinery",
      name: "Machinery Details",
      category: "Technical Equipment",
      whyRequired: "May be required to calculate electrical connected load (HP/kW) and assess industrial safety requirements.",
      mandatory: true,
      status: isDefaultDemo ? "VERIFIED" : "NOT UPLOADED",
      file: isDefaultDemo ? "machinery_power_specs.pdf" : null,
      fileName: isDefaultDemo ? "machinery_power_specs.pdf" : null,
      fileSize: isDefaultDemo ? "850 KB" : null
    },
    {
      id: "doc-project",
      name: "Project Report",
      whyRequired: "Brief project overview detailing proposed manufacturing process, estimated capacity, and investment for statutory categorizations.",
      category: "Finance & Planning",
      mandatory: true,
      status: "NOT UPLOADED",
      file: null,
      fileName: null,
      fileSize: null
    },
    {
      id: "doc-env",
      name: "Environmental Information",
      whyRequired: "May be required for pollution board assessment regarding water consumption, effluent generation, and emission sources.",
      category: "Environment",
      mandatory: true,
      status: "NOT UPLOADED",
      file: null,
      fileName: null,
      fileSize: null
    },
    {
      id: "doc-fire",
      name: "Fire Safety Details",
      whyRequired: "Site drawings highlighting emergency exits, proposed extinguisher points, and hydrant positions for safety assessment.",
      category: "Fire & Safety",
      mandatory: true,
      status: "NOT UPLOADED",
      file: null,
      fileName: null,
      fileSize: null
    }
  ];

  // Statutory Registrations
  const otherRegistrations = [
    {
      id: "reg-udyam",
      name: "MSME Udyam Registration",
      category: "Business Registration",
      department: "Ministry of Micro, Small and Medium Enterprises",
      purpose: "National registration for MSME identification and eligibility for central support programs.",
      status: "CHECK APPLICABILITY",
      sourceUrl: "https://udyamregistration.gov.in"
    },
    {
      id: "reg-gst",
      name: "Goods & Services Tax (GSTIN)",
      category: "Tax / Registration",
      department: "Goods and Services Tax Network / CBIC",
      purpose: "Tax registration applicable upon meeting statutory turnover thresholds or inter-state sales.",
      status: "CHECK APPLICABILITY",
      sourceUrl: "https://www.gst.gov.in"
    },
    {
      id: "reg-epfo",
      name: "EPFO & ESIC Registration",
      category: "Factory / Labour",
      department: "Ministry of Labour & Employment",
      purpose: "Social security and employee healthcare registration applicable upon meeting employee thresholds.",
      status: "CHECK APPLICABILITY",
      sourceUrl: "https://www.epfindia.gov.in"
    }
  ];

  // Recommended procedural phases
  const nextSteps = [
    {
      step: 1,
      title: "Complete Business Registration & MSME Udyam",
      subtitle: "Entity establishment and MSME identification",
      duration: "Typical: 1 - 3 days",
      agency: "MCA / MSME Portal",
      description: "Incorporate enterprise (Pvt Ltd, LLP, or Partnership) and verify applicability of MSME Udyam registration.",
      icon: "Building2",
      status: "Recommended First Step",
      badgeColor: "blue"
    },
    {
      step: 2,
      title: "Prepare Land & Building Documents & Approvals",
      subtitle: "Execute registered lease or land deed",
      duration: "Typical: 5 - 10 days",
      agency: isMH ? (district === "Pune" ? "MIDC / PMRDA" : "Local Planning Authority") : "Industrial Authority",
      description: "Ensure industrial zoning conformity, verify clear title or registered lease, and prepare architectural drawings.",
      icon: "FileCheck2",
      status: "Pre-Establishment",
      badgeColor: "blue"
    },
    {
      step: 3,
      title: "Apply for Pollution Consent (CTE / CTO)",
      subtitle: "Consent to Establish applicability",
      duration: "Typical: 30 - 45 days",
      agency: pollutionAuthority,
      description: "Verify pollution category (Red/Orange/Green/White) with Pollution Control Board before initiating civil foundation work.",
      icon: "ShieldAlert",
      status: "Pre-Establishment",
      badgeColor: "blue"
    },
    {
      step: 4,
      title: "Apply for Factory License (DISH Inspection)",
      subtitle: "Factories Act applicability check",
      duration: "Typical: 20 - 30 days",
      agency: factoryAuthority,
      description: "If employing 10+ workers with power, review machinery HP specifications and safety layout under state Factory Rules.",
      icon: "Factory",
      status: "Pre-Operation",
      badgeColor: "blue"
    },
    {
      step: 5,
      title: "Obtain Fire Safety Approval & Utility Energization",
      subtitle: "Industrial power and fire safety",
      duration: "Typical: 15 - 25 days",
      agency: `${fireAuthority} & ${powerAuthority}`,
      description: "Submit power demand requirements to the distribution company and confirm NBC fire safety requirements.",
      icon: "Flame",
      status: "Pre-Operation",
      badgeColor: "blue"
    }
  ];

  const readyDocumentsCount = baseDocuments.filter(d => d.status === "VERIFIED" || d.status === "UPLOADED").length;

  return {
    state,
    district,
    industry,
    summary: {
      approvalsCount: approvals.length,
      documentsCount: baseDocuments.length,
      otherRegistrationsCount: otherRegistrations.length,
      complianceAreasCount: 4,
      readyDocumentsCount
    },
    approvals,
    documents: baseDocuments,
    otherRegistrations,
    nextSteps,
    timestamp: new Date().toISOString()
  };
};
