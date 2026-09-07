/**
 * Industry Area Eligibility Helper Functions
 * Standard CPCB pollution classification lookup, date formatting,
 * freshness check, and query filtering.
 */

export const POLLUTION_CATEGORIES = {
  RED: {
    id: 'RED',
    name: 'Red Category',
    badge: '🔴 RED',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    headerBg: 'bg-rose-600',
    indexRange: 'Pollution Index 60 and above',
    description: 'Heavy pollution potential. Siting strictly prohibited in residential/sensitive zones. Permitted only in designated heavy/chemical industrial estates equipped with CETP, TSDF, or ZLD systems.'
  },
  ORANGE: {
    id: 'ORANGE',
    name: 'Orange Category',
    badge: '🟠 ORANGE',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    headerBg: 'bg-amber-500',
    indexRange: 'Pollution Index 41 to 59',
    description: 'Moderate pollution potential. Permitted in declared industrial estates and conforming mixed-use clusters with primary/secondary effluent treatment.'
  },
  GREEN: {
    id: 'GREEN',
    name: 'Green Category',
    badge: '🟢 GREEN',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    headerBg: 'bg-emerald-600',
    indexRange: 'Pollution Index 21 to 40',
    description: 'Low pollution potential. Allowed in general industrial estates and designated commercial/industrial transition zones. Minimal or dry effluent operations.'
  },
  WHITE: {
    id: 'WHITE',
    name: 'White Category',
    badge: '⚪ WHITE',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    headerBg: 'bg-slate-600',
    indexRange: 'Pollution Index up to 20',
    description: 'Practically non-polluting. Exempt from statutory Consent to Establish (CTE) & Consent to Operate (CTO) under CPCB guidelines. Permitted across approved business, IT, and industrial areas.'
  }
};

export const CPCB_INDUSTRY_CLASSIFICATIONS = [
  {
    name: 'Chemical Industry',
    category: 'RED',
    rationale: 'Heavy chemicals, organic synthesis, petrochemical derivatives, paints, and solvents generate hazardous waste and toxic air emissions.'
  },
  {
    name: 'Pharmaceutical',
    category: 'RED',
    rationale: 'Active pharmaceutical ingredients (APIs) and bulk drug synthesis generate high-COD trade effluent requiring dedicated CETP/ZLD treatment.'
  },
  {
    name: 'Textile & Garments',
    category: 'ORANGE',
    alternateCategory: 'RED',
    rationale: 'Knitting and stitching are Orange category. Wet chemical dyeing and bleaching are classified under RED category requiring Zero Liquid Discharge (ZLD).'
  },
  {
    name: 'Automobile',
    category: 'ORANGE',
    alternateCategory: 'RED',
    rationale: 'Auto components and assembly without foundry are Orange category. Facilities with heavy paint shops and electroplating fall under RED.'
  },
  {
    name: 'Manufacturing',
    category: 'ORANGE',
    rationale: 'General engineering, sheet metal fabrication, and machining with oil separators fall under Orange category.'
  },
  {
    name: 'Food Processing',
    category: 'ORANGE',
    rationale: 'Dairy processing, canneries, flour mills, and confectionery have moderate biological oxygen demand (BOD) effluent.'
  },
  {
    name: 'Construction',
    category: 'ORANGE',
    rationale: 'Ready-mix concrete (RMC) plants, stone crushers, and pre-cast concrete units involve dust emissions and slurry management.'
  },
  {
    name: 'Electronics',
    category: 'GREEN',
    alternateCategory: 'ORANGE',
    rationale: 'Dry consumer electronics assembly is Green. Printed circuit board (PCB) etching and wave soldering fall under Orange.'
  },
  {
    name: 'Agriculture Processing',
    category: 'GREEN',
    rationale: 'Cold storage, grain grading, spice grinding, and organic packaging generate minimal non-toxic waste.'
  },
  {
    name: 'Renewable Energy',
    category: 'GREEN',
    alternateCategory: 'WHITE',
    rationale: 'Solar PV panel assembly is Green. Standalone solar power generation parks and rooftop units are classified as White (Exempt).'
  },
  {
    name: 'Information Technology',
    category: 'WHITE',
    rationale: 'Software development, cloud infrastructure, ITES, and data centers are completely non-polluting and exempt from SPCB consent.'
  },
  {
    name: 'Other',
    category: 'ORANGE',
    rationale: 'Custom composite activities are evaluated case-by-case based on specific equipment and emissions.'
  }
];

export function detectIndustryPollutionCategory(industryInput = '') {
  if (!industryInput) return null;
  const term = industryInput.trim().toLowerCase();

  const found = CPCB_INDUSTRY_CLASSIFICATIONS.find(item => 
    item.name.toLowerCase() === term ||
    item.name.toLowerCase().includes(term) ||
    term.includes(item.name.toLowerCase())
  );

  if (found) {
    return {
      category: found.category,
      alternateCategory: found.alternateCategory || null,
      name: found.name,
      rationale: found.rationale
    };
  }

  // Keyword heuristics based on CPCB 2016 master table
  if (term.includes('chem') || term.includes('pharma') || term.includes('dye') || term.includes('tanner') || term.includes('metal finish') || term.includes('electroplat') || term.includes('acid')) {
    return {
      category: 'RED',
      name: industryInput,
      rationale: 'Operations involving chemical synthesis, metal plating, or toxic effluents are categorized as RED under CPCB guidelines.'
    };
  }
  if (term.includes('software') || term.includes('it ') || term.includes('data center') || term.includes('solar power') || term.includes('bio-gas') || term.includes('handloom')) {
    return {
      category: 'WHITE',
      name: industryInput,
      rationale: 'Clean technology, IT services, and non-polluting activities are classified as WHITE (Exempt).'
    };
  }
  if (term.includes('cold store') || term.includes('packag') || term.includes('grain') || term.includes('spice') || term.includes('apparel') || term.includes('garment')) {
    return {
      category: 'GREEN',
      name: industryInput,
      rationale: 'Dry packaging, apparel assembly, and agro-sorting fall under GREEN category.'
    };
  }

  return {
    category: 'ORANGE',
    name: industryInput,
    rationale: 'Standard light engineering and processing activities generally fall under ORANGE category.'
  };
}

export function formatVerificationDate(dateStr) {
  if (!dateStr) return 'Not available';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Not available';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return 'Not available';
  }
}

export function isRecordOutdated(dateStr, thresholdMonths = 18) {
  if (!dateStr) return true;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    const now = new Date();
    const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    return diffMonths > thresholdMonths;
  } catch {
    return true;
  }
}
