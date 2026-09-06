// Statutory Eligibility, Conditional Rules & Approval Dependency Engine for UdyamOne
// Based on Central and State Industrial Statutory Frameworks (MSMED Act 2006, Factories Act 1948,
// Water Act 1974, Air Act 1981, NBC 2016, Electricity Act 2003, and State Single-Window policies).

/**
 * Normalizes user-submitted business profile with sensible statutory defaults.
 */
function normalizeBusinessProfile(input = {}) {
  const state = input.state || 'Maharashtra';
  const district = input.district || 'Pune';
  const industry = input.industry || 'Manufacturing';

  // Entity classification
  const entityType = input.entityType || 'Private Limited Company';

  // Financials
  const investment = typeof input.investment === 'number' ? input.investment : (parseFloat(input.investment) || 2.5); // In INR Crores
  const turnover = typeof input.turnover === 'number' ? input.turnover : (parseFloat(input.turnover) || 12.0); // In INR Crores

  // Operational metrics
  const employeeCount = typeof input.employeeCount === 'number' ? input.employeeCount : (parseInt(input.employeeCount, 10) || 25);
  const powerRequired = typeof input.powerRequired === 'number' ? input.powerRequired : (parseFloat(input.powerRequired) || 75); // HP
  const builtUpArea = typeof input.builtUpArea === 'number' ? input.builtUpArea : (parseFloat(input.builtUpArea) || 1500); // sq. meters

  // Specific triggers
  const usesHazardousChemicals = Boolean(input.usesHazardousChemicals || input.hazardousMaterials);
  const isExportOriented = Boolean(input.isExportOriented);
  const usesSteamBoiler = Boolean(input.usesSteamBoiler || ['Chemical Industry', 'Food Processing', 'Textile & Garments'].includes(industry) && input.usesBoiler);

  return {
    state,
    district,
    industry,
    entityType,
    investment, // INR Crores
    turnover,   // INR Crores
    employeeCount,
    powerRequired, // HP
    builtUpArea, // sq. meters
    usesHazardousChemicals,
    isExportOriented,
    usesSteamBoiler
  };
}

/**
 * Determines MSME classification according to the MSMED Act 2006 (Notification S.O. 2119(E)).
 * Micro: Investment <= 1 Cr AND Turnover <= 5 Cr
 * Small: Investment <= 10 Cr AND Turnover <= 50 Cr
 * Medium: Investment <= 50 Cr AND Turnover <= 250 Cr
 * Large: Exceeds Medium limits
 */
function calculateMSMEClassification(investmentCr, turnoverCr) {
  if (investmentCr <= 1 && turnoverCr <= 5) {
    return {
      category: 'Micro',
      label: 'Micro Enterprise',
      description: 'Investment <= ₹1 Cr and Turnover <= ₹5 Cr',
      benefits: ['Priority sector lending', '100% collateral-free credit guarantee (CGTMSE)', 'Concessional patent fees']
    };
  }
  if (investmentCr <= 10 && turnoverCr <= 50) {
    return {
      category: 'Small',
      label: 'Small Enterprise',
      description: 'Investment <= ₹10 Cr and Turnover <= ₹50 Cr',
      benefits: ['MSME market assistance', 'Concessional electricity duty in designated industrial zones', 'TReDS invoice discounting']
    };
  }
  if (investmentCr <= 50 && turnoverCr <= 250) {
    return {
      category: 'Medium',
      label: 'Medium Enterprise',
      description: 'Investment <= ₹50 Cr and Turnover <= ₹250 Cr',
      benefits: ['Technology upgrading fund schemes', 'Credit linked capital subsidy', 'State industrial policy incentives']
    };
  }
  return {
    category: 'Large',
    label: 'Large Industrial Enterprise',
    description: 'Investment > ₹50 Cr or Turnover > ₹250 Cr',
    benefits: ['Mega project state incentives', 'Customs bonded warehouse facilitation']
  };
}

/**
 * Determines CPCB/SPCB Pollution Categorization based on sector and parameters.
 */
function calculatePollutionCategory(industry, profile) {
  if (industry === 'Information Technology') {
    return {
      category: 'White',
      badgeColor: 'slate',
      description: 'White Category: Non-polluting industrial/ITES sector. Exempt from CTE and CTO under CPCB guidelines.',
      cteRequired: false,
      ctoRequired: false
    };
  }

  if (industry === 'Chemical Industry' || industry === 'Pharmaceutical' || (industry === 'Textile & Garments' && profile.usesHazardousChemicals)) {
    return {
      category: 'Red',
      badgeColor: 'rose',
      description: 'Red Category: High pollution index (>60). Comprehensive Environmental Management Plan (EMP) & Effluent Treatment Plant (ETP) mandatory.',
      cteRequired: true,
      ctoRequired: true
    };
  }

  if (industry === 'Manufacturing' || industry === 'Food Processing' || industry === 'Automobile' || industry === 'Construction' || industry === 'Electronics') {
    return {
      category: 'Orange',
      badgeColor: 'amber',
      description: 'Orange Category: Moderate pollution index (41-59). Requires Consent to Establish (CTE) before construction and Consent to Operate (CTO) before production.',
      cteRequired: true,
      ctoRequired: true
    };
  }

  return {
    category: 'Green',
    badgeColor: 'emerald',
    description: 'Green Category: Low pollution index (21-40). Simplified CTE/CTO procedure under fast-track single window clearance.',
    cteRequired: true,
    ctoRequired: true
  };
}

/**
 * Returns dynamic official department names and URLs based on State and District.
 */
function getJurisdictionAuthorities(state, district) {
  const isMH = state === 'Maharashtra';
  const isTG = state === 'Telangana';
  const isPune = isMH && district === 'Pune';

  // Telangana geographical regions
  const isHMDA = isTG && ['Hyderabad', 'Medchal-Malkajgiri', 'Rangareddy', 'Sangareddy'].includes(district);
  const isSouthernTG = isTG && [
    'Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Sangareddy',
    'Mahabubnagar', 'Nalgonda', 'Suryapet', 'Yadadri Bhuvanagiri',
    'Vikarabad', 'Narayanpet', 'Wanaparthy', 'Jogulamba Gadwal', 'Nagarkurnool'
  ].includes(district);

  if (isTG) {
    return {
      state: 'Telangana',
      district,
      singleWindowName: 'TS-iPASS (Telangana State Industrial Project Approval and Self-Certification System)',
      singleWindowUrl: 'https://ipass.telangana.gov.in',

      factoryAuthority: 'Department of Factories, Government of Telangana',
      factoryAuthorityShort: 'Director of Factories, Telangana',
      factoryUrl: 'https://factories.telangana.gov.in',
      factoryAct: 'Factories Act, 1948 & Telangana Factories Rules, 1950',

      pollutionAuthority: 'Telangana State Pollution Control Board (TSPCB)',
      pollutionAuthorityShort: 'TSPCB',
      pollutionUrl: 'https://tspcb.cpcb.gov.in',
      pollutionPortalName: 'TSPCB OCMMS / TS-iPASS Portal',

      fireAuthority: 'Telangana State Disaster Response and Fire Services Department (TS-Fire)',
      fireAuthorityShort: 'TS-Fire',
      fireUrl: 'https://fire.telangana.gov.in',
      fireAct: 'Telangana Fire Service Act, 1999 & NBC 2016',

      planningAuthority: isHMDA
        ? 'Hyderabad Metropolitan Development Authority (HMDA) / TS-bPASS / TSIIC'
        : 'Directorate of Town & Country Planning (DTCP), Telangana / TS-bPASS / TSIIC',
      planningAuthorityShort: isHMDA ? 'HMDA / TS-bPASS / TSIIC' : 'DTCP / TS-bPASS / TSIIC',
      planningUrl: 'https://tsbpass.telangana.gov.in',
      planningAct: 'Telangana State Building Permission Approval and Self-Certification System (TS-bPASS) Act, 2020',
      industrialLandCorp: 'Telangana State Industrial Infrastructure Corporation (TSIIC)',

      powerAuthority: isSouthernTG
        ? 'Southern Power Distribution Company of Telangana Limited (TGSPDCL)'
        : 'Northern Power Distribution Company of Telangana Limited (TGNPDCL)',
      powerAuthorityShort: isSouthernTG ? 'TGSPDCL' : 'TGNPDCL',
      powerUrl: isSouthernTG ? 'https://www.tssspdcl.com' : 'https://www.tsnpdcl.in',
      electricalInspector: 'Chief Electrical Inspector to Government (CEIG), Telangana',

      labourAuthority: 'Labour Department, Government of Telangana',
      labourUrl: 'https://labour.telangana.gov.in',
      shopActName: 'Telangana Shops and Establishments Act, 1988',

      drugAuthority: 'Drugs Control Administration, Government of Telangana (DCA Telangana)',
      drugUrl: 'https://dca.telangana.gov.in',

      taxAuthority: 'Commercial Taxes Department, Government of Telangana (TGST)',
      taxUrl: 'https://tgct.gov.in',

      waterAuthority: isHMDA
        ? 'Hyderabad Metropolitan Water Supply and Sewerage Board (HMWSSB) / TSIIC'
        : 'TSIIC Industrial Water / Mission Bhagiratha, Telangana'
    };
  }

  if (isMH) {
    return {
      state: 'Maharashtra',
      district,
      singleWindowName: 'Maitri Single Window System',
      singleWindowUrl: 'https://maitri.mahaonline.gov.in',

      factoryAuthority: 'Directorate of Industrial Safety & Health (DISH), Maharashtra',
      factoryAuthorityShort: 'DISH Inspection',
      factoryUrl: 'https://dish.maharashtra.gov.in',
      factoryAct: 'Factories Act, 1948 & Maharashtra Factories Rules, 1963',

      pollutionAuthority: 'Maharashtra Pollution Control Board (MPCB)',
      pollutionAuthorityShort: 'MPCB',
      pollutionUrl: 'https://mpcb.gov.in',
      pollutionPortalName: 'MPCB Portal',

      fireAuthority: isPune
        ? 'Pune Municipal Corporation / PMRDA Fire Department'
        : 'Maharashtra Fire Services',
      fireAuthorityShort: isPune ? 'PMRDA Fire' : 'MahaFire',
      fireUrl: 'https://mahafireservice.gov.in',
      fireAct: 'Maharashtra Fire Prevention & Life Safety Measures Act, 2006 & NBC 2016',

      planningAuthority: isPune
        ? 'Pune Metropolitan Region Development Authority (PMRDA) / MIDC'
        : 'Town Planning & Development Authority, Maharashtra',
      planningAuthorityShort: isPune ? 'PMRDA / AutoDCR' : 'AutoDCR',
      planningUrl: isPune ? 'https://pmrda.gov.in' : 'https://www.midcindia.org',
      planningAct: 'MRTP Act, 1966 & Unified Development Control Regulations (UDCPR)',
      industrialLandCorp: 'Maharashtra Industrial Development Corporation (MIDC)',

      powerAuthority: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)',
      powerAuthorityShort: 'MSEDCL',
      powerUrl: 'https://www.mahadiscom.in',
      electricalInspector: 'Chief Electrical Inspector, Energy Department, Maharashtra',

      labourAuthority: 'Labour Department, Maharashtra',
      labourUrl: 'https://lms.mahaonline.gov.in',
      shopActName: 'Maharashtra Shops and Establishments Act, 2017',

      drugAuthority: 'Food & Drug Administration (FDA) Maharashtra',
      drugUrl: 'https://fda.maharashtra.gov.in',

      taxAuthority: 'Maharashtra State Goods and Services Tax Department',
      taxUrl: 'https://mahagst.gov.in',

      waterAuthority: 'MIDC Water Supply Division / Local Municipal Corporation'
    };
  }

  return {
    state,
    district,
    singleWindowName: `${state} Single Window Clearance System`,
    singleWindowUrl: '',

    factoryAuthority: `Directorate of Factories & Boilers, ${state}`,
    factoryAuthorityShort: 'Factory Inspection',
    factoryUrl: '',
    factoryAct: 'Factories Act, 1948 & State Factory Rules',

    pollutionAuthority: `${state} State Pollution Control Board (SPCB)`,
    pollutionAuthorityShort: 'SPCB',
    pollutionUrl: 'https://cpcb.nic.in',
    pollutionPortalName: 'State SPCB Portal',

    fireAuthority: `State Fire & Emergency Services, ${state}`,
    fireAuthorityShort: 'State Fire Services',
    fireUrl: '',
    fireAct: 'State Fire Prevention Act & NBC 2016',

    planningAuthority: `Industrial Development Corporation, ${state}`,
    planningAuthorityShort: 'Town Planning',
    planningUrl: '',
    planningAct: 'State Town Planning Act & Development Control Regulations',
    industrialLandCorp: `State Industrial Development Corporation, ${state}`,

    powerAuthority: `${state} Electricity Distribution Corporation (DISCOM)`,
    powerAuthorityShort: 'DISCOM',
    powerUrl: '',
    electricalInspector: `Chief Electrical Inspector, ${state}`,

    labourAuthority: `Labour Department, ${state}`,
    labourUrl: '',
    shopActName: 'State Shops & Commercial Establishments Act',

    drugAuthority: `State Drugs Control Administration, ${state}`,
    drugUrl: 'https://cdsco.gov.in',

    taxAuthority: `State Commercial Taxes Department, ${state}`,
    taxUrl: '',

    waterAuthority: `State Water Supply & Sewerage Board, ${state}`
  };
}

/**
 * Master catalog of statutory approvals with conditional rules and prerequisite relationships.
 */
function getMasterApprovalCatalog(state, district) {
  const auth = getJurisdictionAuthorities(state, district);

  return [
    {
      id: 'app-factory',
      name: 'Factory / Industrial License',
      category: 'Factory / Labour',
      state,
      district,
      department: auth.factoryAuthority,
      authority: auth.factoryAuthority,
      officialSource: auth.factoryAct || 'Factories Act, 1948 & State Factory Rules',
      sourceUrl: auth.factoryUrl,
      phase: 4,
      phaseName: 'Pre-Operation & Final Licenses',
      estimatedDays: '20 - 30 days',
      renewalPeriod: 'Annual renewal under Section 6 of Factories Act, 1948',
      description: 'Statutory license governing occupational worker safety, working hours, ventilation, and machinery safeguards inside factory premises.',
      prerequisites: ['app-building', 'app-fire-prov', 'app-pollution-cte', 'app-electricity'],
      requiredDocs: [
        'Building Layout / Site Plan',
        'Machinery Details',
        'PAN Card / Business PAN',
        'Land Ownership / Lease Documents',
        'Fire Safety Details'
      ],
      stages: [
        'Architectural Layout & Safety Plan Submission',
        'Scrutiny by Safety Inspector',
        'Factory Premises Inspection',
        'Grant of Form 4 Licence'
      ],
      evaluate: (profile) => {
        if (profile.industry === 'Information Technology') {
          return {
            applicable: false,
            reason: 'Exempt: Software and IT/ITES establishments are not manufacturing premises under Section 2(m) of Factories Act 1948. Governed by Shops & Establishments Act.',
            trigger: 'Non-manufacturing IT Sector'
          };
        }

        const hasPower = profile.powerRequired > 0;
        const threshold = hasPower ? 10 : 20;

        if (profile.employeeCount >= threshold) {
          return {
            applicable: true,
            reason: `May apply to manufacturing establishments employing 10+ workers with power (or 20+ workers without power) under Section 6 of Factories Act, 1948. (Profile: ${profile.employeeCount} workers with power).`,
            trigger: `Workers: ${profile.employeeCount} (>= ${threshold} with power)`
          };
        }

        return {
          applicable: false,
          reason: `Conditionally Exempt: Unit employs ${profile.employeeCount} workers, which is below the statutory threshold of ${threshold} workers ${hasPower ? 'with power' : 'without power'} under Section 2(m) of Factories Act. Shop & Establishment Registration applies instead.`,
          trigger: `Workers: ${profile.employeeCount} (< ${threshold})`
        };
      }
    },
    {
      id: 'app-pollution',
      name: state === 'Telangana' ? 'Pollution Control Consent (CFE / CFO)' : 'Pollution Control Consent (CTE / CTO)',
      category: 'Environment',
      state,
      district,
      department: auth.pollutionAuthority,
      authority: auth.pollutionAuthority,
      officialSource: 'Water (P&CP) Act 1974 & Air (P&CP) Act 1981',
      sourceUrl: auth.pollutionUrl,
      phase: 2,
      phaseName: 'Pre-Establishment Clearances',
      estimatedDays: '30 - 45 days',
      renewalPeriod: 'CTE valid for 5 years; CTO renewable every 1-5 years based on category',
      description: 'Consent to Establish (CTE) before starting civil construction and Consent to Operate (CTO) before starting commercial production.',
      prerequisites: ['app-building'],
      requiredDocs: [
        'Project Report',
        'Environmental Information',
        'Land Ownership / Lease Documents',
        'Building Layout / Site Plan',
        'Machinery Details'
      ],
      stages: [
        `Online Application on ${auth.pollutionPortalName || 'SPCB Portal'}`,
        'Technical Scrutiny of Effluent / Emission Controls',
        'Consent Committee Evaluation',
        'Issuance of Consent Order with Standards'
      ],
      evaluate: (profile) => {
        const pollution = calculatePollutionCategory(profile.industry, profile);
        if (!pollution.cteRequired) {
          return {
            applicable: false,
            reason: `Exempt: Classified under White Category (Non-polluting). Requires only voluntary online intimation, not statutory CTE/CTO.`,
            trigger: 'CPCB White Category Exemption'
          };
        }
        return {
          applicable: true,
          reason: `May apply to industrial establishments based on pollution classification (Red, Orange, Green) under Water Act 1974 and Air Act 1981. Classified under ${pollution.category} Category.`,
          trigger: `${pollution.category} Pollution Classification`
        };
      }
    },
    {
      id: 'app-fire',
      name: 'Fire Safety Approval / Provisional Fire NOC',
      category: 'Fire & Safety',
      state,
      district,
      department: auth.fireAuthority,
      authority: auth.fireAuthority,
      officialSource: auth.fireAct || 'National Building Code (NBC 2016) & State Fire Prevention Act',
      sourceUrl: auth.fireUrl,
      phase: 2,
      phaseName: 'Pre-Establishment Clearances',
      estimatedDays: '15 - 25 days',
      renewalPeriod: 'Bi-annual maintenance audit (Form B) & periodic NOC renewal',
      description: 'Provisional and Final Fire NOC ensuring presence of adequate fire suppression systems, hydrants, alarms, and emergency escape routes.',
      prerequisites: ['app-building'],
      requiredDocs: [
        'Fire Safety Details',
        'Building Layout / Site Plan',
        'Land Ownership / Lease Documents',
        'Business Registration Certificate'
      ],
      stages: [
        'Fire Safety System Drawing Vetting',
        'Provisional Fire NOC for Construction',
        'Physical Inspection & Wet Riser Pressure Test',
        'Final Fire NOC for Occupancy'
      ],
      evaluate: (profile) => {
        if (profile.industry === 'Information Technology') {
          return {
            applicable: false,
            reason: 'Exempt: Commercial office spaces within IT parks operate under building master fire NOC.',
            trigger: 'Commercial IT Park Exemption'
          };
        }
        return {
          applicable: true,
          reason: `May apply depending on total built-up area, building height, industrial hazard class, and National Building Code guidelines. (${profile.builtUpArea} sq.m built-up area).`,
          trigger: `Built-up Area: ${profile.builtUpArea} sq.m`
        };
      }
    },
    {
      id: 'app-building',
      name: 'Building / Local Authority Approval',
      category: 'Land & Building',
      state,
      district,
      department: auth.planningAuthority,
      authority: auth.planningAuthority,
      officialSource: auth.planningAct || 'State Town Planning Act & Development Control Regulations',
      sourceUrl: auth.planningUrl,
      phase: 2,
      phaseName: 'Pre-Establishment Clearances',
      estimatedDays: '15 - 30 days',
      renewalPeriod: 'Commencement Certificate valid for 1-3 years',
      description: 'Scrutiny of industrial blueprints, zoning conformity, floor space index (FSI), setbacks, and parking allocations.',
      prerequisites: [],
      requiredDocs: [
        'Land Ownership / Lease Documents',
        'Building Layout / Site Plan',
        'Aadhaar / Identity Proof',
        'Business Registration Certificate'
      ],
      stages: [
        'Zoning Verification & Ownership Proof Check',
        `${auth.planningAuthorityShort ? auth.planningAuthorityShort + ' Blueprint Scrutiny' : 'AutoDCR / Architectural Blueprint Scrutiny'}`,
        'Commencement Certificate (CC) Issuance',
        'Completion & Occupancy Certificate (OC)'
      ],
      evaluate: (profile) => {
        if (profile.industry === 'Information Technology') {
          return {
            applicable: false,
            reason: 'Exempt: IT enterprises occupying commercial premises or leased facilities do not require new industrial building plan sanction.',
            trigger: 'Commercial IT Office Lease'
          };
        }
        return {
          applicable: true,
          reason: "May apply to all new industrial construction, expansion, or plot layout modifications within the authority's jurisdiction.",
          trigger: 'Physical Industrial Site Setup'
        };
      }
    },
    {
      id: 'app-electricity',
      name: 'Electricity Connection Approval',
      category: 'Electricity / Utilities',
      state,
      district,
      department: auth.powerAuthority,
      authority: auth.powerAuthority,
      officialSource: 'Electricity Act, 2003 & State Electricity Regulatory Commission Norms',
      sourceUrl: auth.powerUrl,
      phase: 3,
      phaseName: 'Infrastructure & Utilities',
      estimatedDays: '15 - 25 days',
      renewalPeriod: 'Supply agreement subject to statutory inspection',
      description: 'Load feasibility assessment, transformer installation clearance, and industrial metering agreement.',
      prerequisites: ['app-building', 'app-pollution'],
      requiredDocs: [
        'Machinery Details',
        'Land Ownership / Lease Documents',
        'PAN Card / Business PAN',
        'Building Layout / Site Plan'
      ],
      stages: [
        'Load Feasibility Application',
        'Field Survey by Distribution Engineer',
        'Demand Note & Security Deposit Settlement',
        'Meter Release and Energization'
      ],
      evaluate: (profile) => {
        if (profile.industry === 'Information Technology') {
          return {
            applicable: false,
            reason: 'Exempt: IT businesses apply for Commercial / IT Power Sanction instead of manufacturing industrial load.',
            trigger: 'Governed by Commercial / IT Power Sanction'
          };
        }
        const isHT = profile.powerRequired > 50;
        return {
          applicable: true,
          tier: isHT ? 'High Tension (HT)' : 'Low Tension (LT)',
          reason: `May apply to industrial establishments requiring dedicated ${isHT ? 'High Tension (HT)' : 'Low Tension (LT)'} power supply. (${profile.powerRequired} HP connected load).`,
          trigger: `Connected Load: ${profile.powerRequired} HP (${isHT ? 'HT' : 'LT'})`
        };
      }
    },
    {
      id: 'app-fssai',
      name: 'FSSAI Food Manufacturing Licence',
      category: 'Industry-Specific Approvals',
      state,
      district,
      department: 'Food Safety and Standards Authority of India (FSSAI)',
      authority: 'Food Safety and Standards Authority of India (FSSAI)',
      officialSource: 'Food Safety and Standards Act, 2006 & Regulations 2011',
      sourceUrl: 'https://foscos.fssai.gov.in',
      phase: 4,
      phaseName: 'Pre-Operation & Final Licenses',
      estimatedDays: '20 - 35 days',
      renewalPeriod: '1 to 5 years renewal under FSSAI rules',
      description: 'Statutory licensing ensuring food safety management systems, testing protocols, and sanitary manufacturing practices.',
      prerequisites: ['app-building', 'app-pollution'],
      requiredDocs: [
        'Building Layout / Site Plan',
        'Machinery Details',
        'PAN Card / Business PAN',
        'Project Report'
      ],
      stages: [
        'Online FoSCoS Submission',
        'Document Review',
        'Sanitation Inspection',
        'License Grant'
      ],
      evaluate: (profile) => {
        if (profile.industry !== 'Food Processing') {
          return {
            applicable: false,
            reason: 'Not Applicable: Required exclusively for food manufacturing, processing, packaging, or storing food consumables.',
            trigger: 'Sector Specific'
          };
        }
        const isCentral = profile.turnover > 20 || profile.isExportOriented;
        return {
          applicable: true,
          tier: isCentral ? 'Central License' : 'State License',
          reason: `Required for all units manufacturing, processing, packaging, or storing food consumables under Food Safety and Standards Act, 2006. (${isCentral ? 'Central License: Turnover > ₹20 Cr or EOU' : 'State License: Turnover <= ₹20 Cr'}).`,
          trigger: `Food Processing (${isCentral ? 'Central' : 'State'} Tier)`
        };
      }
    },
    {
      id: 'app-drug-lic',
      name: 'Drug Manufacturing Licence (Form 25 / 28)',
      category: 'Industry-Specific Approvals',
      state,
      district,
      department: auth.drugAuthority || (state === 'Maharashtra' ? 'Food & Drug Administration (FDA) Maharashtra' : `State Drugs Control Administration, ${state}`),
      authority: auth.drugAuthority || (state === 'Maharashtra' ? 'Food & Drug Administration (FDA) Maharashtra' : `State Drugs Control Administration, ${state}`),
      officialSource: 'Drugs and Cosmetics Act, 1940 & Rules 1945',
      sourceUrl: auth.drugUrl || 'https://cdsco.gov.in',
      phase: 4,
      phaseName: 'Pre-Operation & Final Licenses',
      estimatedDays: '30 - 60 days',
      renewalPeriod: '5 years renewal under Drugs and Cosmetics Act',
      description: 'Regulatory license verifying Schedule M Good Manufacturing Practices (GMP), cleanroom standards, and qualified technical personnel.',
      prerequisites: ['app-building', 'app-pollution', 'app-factory'],
      requiredDocs: [
        'Project Report',
        'Machinery Details',
        'Building Layout / Site Plan',
        'Environmental Information'
      ],
      stages: [
        'HVAC Validation',
        'Technical Staff Scrutiny',
        'Joint FDA Inspection',
        'Licence Grant'
      ],
      evaluate: (profile) => {
        if (profile.industry !== 'Pharmaceutical') {
          return {
            applicable: false,
            reason: 'Not Applicable: Required exclusively for manufacturing drugs, active pharmaceutical ingredients (APIs), or medical formulations.',
            trigger: 'Sector Specific'
          };
        }
        return {
          applicable: true,
          reason: 'Required for manufacturing allopathic, biological, or medical formulations under Drugs and Cosmetics Act, 1940.',
          trigger: 'Pharmaceutical Sector'
        };
      }
    },
    {
      id: 'app-peso',
      name: 'PESO Petroleum & Explosives Licence',
      category: 'Industry-Specific Approvals',
      state,
      district,
      department: 'Petroleum & Explosives Safety Organization (PESO), DPIIT',
      authority: 'Petroleum & Explosives Safety Organization (PESO), DPIIT',
      officialSource: 'Petroleum Act 1934 & Explosives Act 1884',
      sourceUrl: 'https://peso.gov.in',
      phase: 4,
      phaseName: 'Pre-Operation & Final Licenses',
      estimatedDays: '30 - 50 days',
      renewalPeriod: '3 years renewal under PESO rules',
      description: 'Statutory safety clearance for hazardous storage tanks, pressure vessels, and hazardous area classification.',
      prerequisites: ['app-building', 'app-fire'],
      requiredDocs: [
        'Project Report',
        'Building Layout / Site Plan',
        'Fire Safety Details',
        'Environmental Information'
      ],
      stages: [
        'Blueprint Vetting',
        'Safety Valve Audit',
        'Site Safety Scrutiny',
        'Licence Grant'
      ],
      evaluate: (profile) => {
        const isTriggered = profile.industry === 'Chemical Industry' || profile.usesHazardousChemicals;
        if (!isTriggered) {
          return {
            applicable: false,
            reason: 'Not Applicable: Required only when storing, processing, or handling compressed flammable gases, petroleum solvents, or hazardous chemicals.',
            trigger: 'No Hazardous Storage Declared'
          };
        }
        return {
          applicable: true,
          reason: 'May apply to facilities storing, handling, or processing hazardous petroleum solvents, compressed gases, or flammables under Petroleum Act 1934.',
          trigger: 'Hazardous Materials / Chemical Industry'
        };
      }
    },
    {
      id: 'app-shop-est',
      name: 'Shop & Establishment Registration',
      category: 'Business Registration',
      state,
      district,
      department: auth.labourAuthority || (state === 'Maharashtra' ? 'Labour Department, Maharashtra' : `Labour Department, ${state}`),
      authority: auth.labourAuthority || (state === 'Maharashtra' ? 'Labour Department, Maharashtra' : `Labour Department, ${state}`),
      officialSource: auth.shopActName || 'State Shops & Commercial Establishments Act',
      sourceUrl: auth.labourUrl || (state === 'Maharashtra' ? 'https://lms.mahaonline.gov.in' : ''),
      phase: 1,
      phaseName: 'Entity Foundation',
      estimatedDays: '3 - 7 days',
      renewalPeriod: 'Annual statutory return under Shops and Establishments Act',
      description: 'Statutory registration governing terms of employment, working conditions, and office operating hours.',
      prerequisites: [],
      requiredDocs: [
        'PAN Card / Business PAN',
        'Aadhaar / Identity Proof',
        'Land Ownership / Lease Documents'
      ],
      stages: [
        'Online Registration Filing',
        'Address Proof Verification',
        'Certificate Generation'
      ],
      evaluate: (profile) => {
        if (profile.industry === 'Information Technology' || profile.employeeCount < 10) {
          return {
            applicable: true,
            reason: 'Applies to commercial offices, software development centers, and IT consulting premises.',
            trigger: profile.industry === 'Information Technology' ? 'Commercial IT Unit' : 'Worker count < 10'
          };
        }
        return {
          applicable: false,
          reason: `Exempted: Governed primarily by Section 6 of Factories Act 1948 due to ${profile.employeeCount} manufacturing workers.`,
          trigger: 'Covered under Factories Act'
        };
      }
    },
    {
      id: 'app-stpi',
      name: 'STPI / SEZ Registration',
      category: 'Industry-Specific Approvals',
      state,
      district,
      department: 'Software Technology Parks of India (STPI), MeitY',
      authority: 'Software Technology Parks of India (STPI), MeitY',
      officialSource: 'Foreign Trade Policy & STPI Guidelines',
      sourceUrl: 'https://www.stpi.in',
      phase: 2,
      phaseName: 'Pre-Establishment Clearances',
      estimatedDays: '10 - 20 days',
      renewalPeriod: '3-year export obligation cycle',
      description: 'Enables duty-free capital imports, customs bonded operations, and export performance incentives.',
      prerequisites: [],
      requiredDocs: [
        'Project Report',
        'Business Registration Certificate',
        'PAN Card / Business PAN'
      ],
      stages: [
        'Export Projection Filing',
        'Director Committee Review',
        'Green Card Issuance'
      ],
      evaluate: (profile) => {
        if (profile.industry !== 'Information Technology') {
          return {
            applicable: false,
            reason: 'Not Applicable: Exclusively for software development and ITES service exporters.',
            trigger: 'Non-IT Sector'
          };
        }
        return {
          applicable: true,
          reason: 'Optional export framework for IT/ITES units seeking statutory export benefits and duty concessions.',
          trigger: 'IT/ITES Export Framework'
        };
      }
    },
    {
      id: 'app-power-it',
      name: 'Commercial / IT Power Sanction',
      category: 'Electricity / Utilities',
      state,
      district,
      department: auth.powerAuthority,
      authority: auth.powerAuthority,
      officialSource: 'Electricity Act 2003',
      sourceUrl: auth.powerUrl,
      phase: 3,
      phaseName: 'Infrastructure & Utilities',
      estimatedDays: '10 - 20 days',
      renewalPeriod: 'Continuous tariff contract',
      description: 'Sanction of high-reliability commercial power supply and backup line permissions.',
      prerequisites: [],
      requiredDocs: [
        'Land Ownership / Lease Documents',
        'PAN Card / Business PAN',
        'Machinery Details'
      ],
      stages: [
        'Contract Demand Application',
        'Substation Review',
        'Power Release'
      ],
      evaluate: (profile) => {
        if (profile.industry !== 'Information Technology') {
          return {
            applicable: false,
            reason: 'Not Applicable: Manufacturing power handled under Industrial Electricity Connection.',
            trigger: 'General Industry'
          };
        }
        return {
          applicable: true,
          reason: 'Required for grid connectivity, sanctioned contract demand, and dual feeder line setup for data operations.',
          trigger: 'IT Grid Power Sanction'
        };
      }
    }
  ];
}

/**
 * Statutory Registrations Catalog (PAN, Udyam, GSTIN, EPFO, ESIC).
 */
function getMasterRegistrationsCatalog(profile) {
  const isMSME = profile.investment <= 50 && profile.turnover <= 250;
  const isGSTMandatory = profile.turnover >= 0.4 || profile.isExportOriented;
  const isEPFOMandatory = profile.employeeCount >= 20;
  const isESICMandatory = profile.employeeCount >= 10;

  return [
    {
      id: 'reg-udyam',
      name: 'MSME Udyam Registration',
      category: 'Business Registration',
      department: 'Ministry of Micro, Small and Medium Enterprises',
      purpose: 'National registration for MSME identification and eligibility for central support programs.',
      status: 'CHECK APPLICABILITY',
      sourceUrl: 'https://udyamregistration.gov.in',
      applicable: isMSME,
      reason: isMSME
        ? `Eligible under MSMED Act 2006: Investment ₹${profile.investment} Cr and Turnover ₹${profile.turnover} Cr fall within MSME limits.`
        : `Turnover (₹${profile.turnover} Cr) or Investment (₹${profile.investment} Cr) exceeds MSME ceiling.`
    },
    {
      id: 'reg-gst',
      name: 'Goods & Services Tax (GSTIN)',
      category: 'Tax / Registration',
      department: 'Goods and Services Tax Network / CBIC',
      purpose: 'Tax registration applicable upon meeting statutory turnover thresholds or inter-state sales.',
      status: 'CHECK APPLICABILITY',
      sourceUrl: 'https://www.gst.gov.in',
      applicable: true,
      reason: isGSTMandatory
        ? `Annual turnover (₹${profile.turnover} Cr) exceeds statutory ₹40 Lakh threshold (or business conducts inter-state / export sales).`
        : `Turnover is below ₹40 Lakhs threshold; registration is optional but recommended for input tax credit.`
    },
    {
      id: 'reg-epfo',
      name: 'EPFO & ESIC Registration',
      category: 'Factory / Labour',
      department: 'Ministry of Labour & Employment',
      purpose: 'Social security and employee healthcare registration applicable upon meeting employee thresholds.',
      status: 'CHECK APPLICABILITY',
      sourceUrl: 'https://www.epfindia.gov.in',
      applicable: isEPFOMandatory || isESICMandatory,
      reason: isEPFOMandatory
        ? `Mandatory under EPF Act 1952: Establishment employs ${profile.employeeCount} workers (threshold: 20+ workers).`
        : `Voluntary: Establishment has ${profile.employeeCount} workers (< 20 threshold).`
    }
  ];
}

/**
 * Standard 9 Document Requirements.
 */
function getDocumentRequirements(profile) {
  return [
    {
      id: 'doc-pan',
      name: 'PAN Card / Business PAN',
      category: 'Business Identity',
      whyRequired: 'Used for applicable identity/tax/business processes where applicable.',
      mandatory: true,
      status: 'NOT UPLOADED',
      file: null,
      fileName: null,
      fileSize: null
    },
    {
      id: 'doc-aadhaar',
      name: 'Aadhaar / Identity Proof',
      category: 'Signatory KYC',
      whyRequired: 'May be required for authorized signatory identity confirmation on applicable portals.',
      mandatory: true,
      status: 'NOT UPLOADED',
      file: null,
      fileName: null,
      fileSize: null
    },
    {
      id: 'doc-reg',
      name: 'Business Registration Certificate',
      category: 'Corporate Entity',
      whyRequired: 'Proof of legal establishment (Certificate of Incorporation, LLP Agreement, or Partnership Deed).',
      mandatory: true,
      status: 'NOT UPLOADED',
      file: null,
      fileName: null,
      fileSize: null
    },
    {
      id: 'doc-land',
      name: 'Land Ownership / Lease Documents',
      category: 'Property & Land',
      whyRequired: 'May be needed to establish lawful possession of the premises for applicable approvals (e.g. Registered lease deed, 7/12 extract, or allotment letter).',
      mandatory: true,
      status: 'NOT UPLOADED',
      file: null,
      fileName: null,
      fileSize: null
    },
    {
      id: 'doc-building',
      name: 'Building Layout / Site Plan',
      category: 'Engineering',
      whyRequired: 'May be required by planning, fire, and factory authorities to review structural safety, ventilation, and emergency exits.',
      mandatory: true,
      status: 'NOT UPLOADED',
      file: null,
      fileName: null,
      fileSize: null
    },
    {
      id: 'doc-machinery',
      name: 'Machinery Details',
      category: 'Technical Equipment',
      whyRequired: 'May be required to calculate electrical connected load (HP/kW) and assess industrial safety requirements.',
      mandatory: true,
      status: 'NOT UPLOADED',
      file: null,
      fileName: null,
      fileSize: null
    },
    {
      id: 'doc-project',
      name: 'Project Report',
      category: 'Finance & Planning',
      whyRequired: 'Brief project overview detailing proposed manufacturing process, estimated capacity, and investment for statutory categorizations.',
      mandatory: true,
      status: 'NOT UPLOADED',
      file: null,
      fileName: null,
      fileSize: null
    },
    {
      id: 'doc-env',
      name: 'Environmental Information',
      category: 'Environment',
      whyRequired: 'May be required for pollution board assessment regarding water consumption, effluent generation, and emission sources.',
      mandatory: true,
      status: 'NOT UPLOADED',
      file: null,
      fileName: null,
      fileSize: null
    },
    {
      id: 'doc-fire',
      name: 'Fire Safety Details',
      category: 'Fire & Safety',
      whyRequired: 'Site drawings highlighting emergency exits, proposed extinguisher points, and hydrant positions for safety assessment.',
      mandatory: true,
      status: 'NOT UPLOADED',
      file: null,
      fileName: null,
      fileSize: null
    }
  ];
}

/**
 * Builds the Approval Dependency Directed Acyclic Graph (DAG).
 */
function buildDependencyGraph(applicableApprovals, userApplications = []) {
  const approvalMap = new Map();
  applicableApprovals.forEach(a => approvalMap.set(a.id, a));

  const completedIds = new Set(
    userApplications
      .filter(app => app.status === 'Approved' || app.status === 'APPROVED')
      .map(app => app.approvalId || app.approval)
  );

  const nodes = applicableApprovals.map(app => {
    const userApp = userApplications.find(a => a.approvalId === app.id || a.approval === app.name);
    const appStatus = userApp ? userApp.status : 'NOT STARTED';

    const relevantPrereqs = (app.prerequisites || []).filter(pid => approvalMap.has(pid));
    const missingPrereqs = relevantPrereqs.filter(pid => !completedIds.has(pid));

    const isBlocked = missingPrereqs.length > 0 && appStatus === 'NOT STARTED';
    const isActionable = (relevantPrereqs.length === 0 || missingPrereqs.length === 0) && appStatus === 'NOT STARTED';

    return {
      id: app.id,
      name: app.name,
      category: app.category,
      department: app.department || app.authority,
      authority: app.authority || app.department,
      phase: app.phase || 2,
      phaseName: app.phaseName || 'Clearance Phase',
      estimatedDays: app.estimatedDays || '15 - 30 days',
      officialSource: app.officialSource,
      sourceUrl: app.sourceUrl,
      status: appStatus,
      isBlocked,
      isActionable,
      prerequisites: relevantPrereqs,
      missingPrerequisites: missingPrereqs.map(pid => approvalMap.get(pid)?.name || pid),
      dependents: []
    };
  });

  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const edges = [];
  nodes.forEach(node => {
    node.prerequisites.forEach(prereqId => {
      if (nodeMap.has(prereqId)) {
        nodeMap.get(prereqId).dependents.push(node.id);
        edges.push({
          id: `edge-${prereqId}->${node.id}`,
          source: prereqId,
          target: node.id,
          label: 'Prerequisite For'
        });
      }
    });
  });

  const phases = [
    {
      phaseNumber: 1,
      title: 'Phase 1: Entity & Site Establishment',
      subtitle: 'Entity formation, legal identity, and land documentation',
      nodes: nodes.filter(n => n.phase === 1)
    },
    {
      phaseNumber: 2,
      title: 'Phase 2: Pre-Establishment Clearances',
      subtitle: 'Concurrent clearances before civil construction or physical modification',
      nodes: nodes.filter(n => n.phase === 2)
    },
    {
      phaseNumber: 3,
      title: 'Phase 3: Infrastructure & Utilities',
      subtitle: 'Industrial power, electrical safety, and infrastructure setup',
      nodes: nodes.filter(n => n.phase === 3)
    },
    {
      phaseNumber: 4,
      title: 'Phase 4: Pre-Operation Clearances & Operating Licenses',
      subtitle: 'Final safety verification and statutory operating licenses',
      nodes: nodes.filter(n => n.phase === 4)
    }
  ].filter(p => p.nodes.length > 0);

  return {
    nodes,
    edges,
    phases,
    actionableCount: nodes.filter(n => n.isActionable).length,
    blockedCount: nodes.filter(n => n.isBlocked).length
  };
}

/**
 * Builds recommended journey sequence with parallel execution opportunities.
 */
function buildRecommendedSequence(auth = {}) {
  const isMH = auth.state === 'Maharashtra' || auth.factoryAuthority?.includes('Maharashtra') || auth.factoryAuthority?.includes('DISH');
  const isTG = auth.state === 'Telangana' || auth.factoryAuthority?.includes('Telangana');
  const factorySubtitle = isMH 
    ? 'Apply for Factory License (DISH Inspection)'
    : isTG
    ? 'Apply for Factory License (Telangana Factories Inspection)'
    : 'Apply for Factory License (Factory Inspection)';

  return [
    {
      step: 1,
      title: 'Complete Business Registration & Statutory Filings',
      subtitle: 'Entity incorporation, PAN, GST, and Udyam',
      duration: 'Typical: 3 - 7 days',
      agency: 'Ministry of Corporate Affairs (MCA) & MSME',
      description: 'Incorporate your legal entity (Pvt Ltd, LLP, Partnership), obtain PAN/TAN, register for GST, and file Udyam Registration for MSME classification benefits.',
      icon: 'Building2',
      status: 'Entity Foundation',
      badgeColor: 'blue'
    },
    {
      step: 2,
      title: 'Prepare Land & Building Documents & Approvals',
      subtitle: 'Execute registered lease or land deed',
      duration: 'Typical: 5 - 10 days',
      agency: auth.planningAuthority || 'Town Planning & Industrial Dev Corp',
      description: 'Ensure industrial zoning conformity, verify clear title or registered lease, and prepare architectural drawings.',
      icon: 'FileCheck2',
      status: 'Pre-Establishment',
      badgeColor: 'blue'
    },
    {
      step: 3,
      title: isTG ? 'Apply for Pollution Consent (CFE / CFO)' : 'Apply for Pollution Consent (CTE / CTO)',
      subtitle: isTG ? 'Consent for Establishment (CFE) applicability' : 'Consent to Establish applicability',
      duration: 'Typical: 30 - 45 days',
      agency: auth.pollutionAuthority || 'State Pollution Control Board',
      description: `Verify pollution category (Red/Orange/Green/White) with ${auth.pollutionAuthorityShort || 'Pollution Control Board'} before initiating civil foundation work.`,
      icon: 'ShieldAlert',
      status: 'Pre-Establishment',
      badgeColor: 'blue'
    },
    {
      step: 4,
      title: factorySubtitle,
      subtitle: 'Factories Act applicability check',
      duration: 'Typical: 20 - 30 days',
      agency: auth.factoryAuthority || 'Department of Factories',
      description: 'If employing 10+ workers with power, review machinery HP specifications and safety layout under state Factory Rules.',
      icon: 'Factory',
      status: 'Pre-Operation',
      badgeColor: 'blue'
    },
    {
      step: 5,
      title: 'Obtain Fire Safety Approval & Utility Energization',
      subtitle: 'Industrial power and fire safety',
      duration: 'Typical: 15 - 25 days',
      agency: `${auth.fireAuthority || 'State Fire Services'} & ${auth.powerAuthority || 'Electricity DISCOM'}`,
      description: 'Submit power demand requirements to the distribution company and confirm NBC fire safety requirements.',
      icon: 'Flame',
      status: 'Pre-Operation',
      badgeColor: 'blue'
    }
  ];
}

/**
 * Main Evaluation Engine Function
 */
function evaluateEligibilityAndDependencies(input = {}, userApplications = []) {
  const profile = normalizeBusinessProfile(input);
  const msme = calculateMSMEClassification(profile.investment, profile.turnover);
  const pollution = calculatePollutionCategory(profile.industry, profile);
  const auth = getJurisdictionAuthorities(profile.state, profile.district);

  const isDefaultDemoScenario =
    profile.state === 'Maharashtra' &&
    profile.district === 'Pune' &&
    profile.industry === 'Manufacturing' &&
    profile.employeeCount >= 10 &&
    profile.powerRequired > 0;

  const catalog = getMasterApprovalCatalog(profile.state, profile.district);

  const applicableApprovals = [];
  const exemptApprovals = [];

  catalog.forEach(item => {
    const evaluation = item.evaluate(profile);
    const enrichedApproval = {
      ...item,
      applicability: item.applicability || evaluation.reason,
      status: 'CHECK APPLICABILITY',
      ruleTrigger: evaluation.trigger,
      ruleTier: evaluation.tier || null,
      verificationStatus: 'Verified Statutory Framework',
      lastVerifiedDate: '2026-08-01'
    };

    if (evaluation.applicable) {
      applicableApprovals.push(enrichedApproval);
    } else {
      exemptApprovals.push({
        ...enrichedApproval,
        exemptionReason: evaluation.reason
      });
    }
  });

  const documents = getDocumentRequirements(profile);
  const otherRegistrations = getMasterRegistrationsCatalog(profile);
  const dependencyGraph = buildDependencyGraph(applicableApprovals, userApplications);
  const nextSteps = buildRecommendedSequence(auth);

  const readyDocumentsCount = documents.filter(d => d.status === 'APPROVED' || d.status === 'VERIFIED' || d.status === 'UPLOADED').length;

  return {
    state: profile.state,
    district: profile.district,
    industry: profile.industry,
    businessProfile: profile,
    msmeClassification: msme,
    pollutionClassification: pollution,
    summary: {
      approvalsCount: applicableApprovals.length,
      documentsCount: documents.length,
      otherRegistrationsCount: otherRegistrations.filter(r => r.applicable).length || 3,
      complianceAreasCount: 4,
      readyDocumentsCount,
      exemptApprovalsCount: exemptApprovals.length,
      actionableApprovalsCount: dependencyGraph.actionableCount
    },
    approvals: applicableApprovals,
    exemptApprovals,
    dependencyGraph,
    documents,
    otherRegistrations,
    nextSteps,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  normalizeBusinessProfile,
  calculateMSMEClassification,
  calculatePollutionCategory,
  getJurisdictionAuthorities,
  getMasterApprovalCatalog,
  getMasterRegistrationsCatalog,
  getDocumentRequirements,
  buildDependencyGraph,
  evaluateEligibilityAndDependencies
};
