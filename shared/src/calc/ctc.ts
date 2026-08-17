export interface CtcInput {
  annualCtc: number;
  isMetro: boolean;
  pfCapped?: boolean; // Cap PF at 1800/mo (21600/yr)
  ptAnnual?: number; // Configurable professional tax
}

export interface CtcResult {
  annual: {
    basic: number;
    hra: number;
    specialAllowance: number;
    gross: number;
    pfEmployer: number;
    pfEmployee: number;
    professionalTax: number;
    totalDeductions: number;
    netInHand: number;
  };
  monthly: {
    basic: number;
    hra: number;
    specialAllowance: number;
    gross: number;
    pfEmployer: number;
    pfEmployee: number;
    professionalTax: number;
    totalDeductions: number;
    netInHand: number;
  };
}

export function calculateCTC(input: CtcInput): CtcResult {
  const { annualCtc, isMetro } = input;

  // Rules of thumb for CTC calculation
  const basicAnnual = annualCtc * 0.50;
  const hraAnnual = basicAnnual * (isMetro ? 0.50 : 0.40);
  
  // PF is 12% of Basic, optionally capped at Rs. 15,000/mo (21,600/yr)
  const pfCapped = input.pfCapped !== false; // Default to true
  let pfEmployerAnnual = basicAnnual * 0.12;
  let pfEmployeeAnnual = basicAnnual * 0.12;
  if (pfCapped) {
    pfEmployerAnnual = Math.min(pfEmployerAnnual, 21600);
    pfEmployeeAnnual = Math.min(pfEmployeeAnnual, 21600);
  }

  // Professional Tax (varies by state, defaulting to 2500)
  const ptAnnual = input.ptAnnual ?? 2500;

  // Special Allowance is whatever is left from CTC after Basic, HRA, and Employer PF
  const specialAllowanceAnnual = Math.max(0, annualCtc - (basicAnnual + hraAnnual + pfEmployerAnnual));

  const grossAnnual = basicAnnual + hraAnnual + specialAllowanceAnnual;
  const totalDeductionsAnnual = pfEmployeeAnnual + ptAnnual;
  const netInHandAnnual = grossAnnual - totalDeductionsAnnual;

  const round = (val: number) => Math.round(val * 100) / 100;

  return {
    annual: {
      basic: round(basicAnnual),
      hra: round(hraAnnual),
      specialAllowance: round(specialAllowanceAnnual),
      gross: round(grossAnnual),
      pfEmployer: round(pfEmployerAnnual),
      pfEmployee: round(pfEmployeeAnnual),
      professionalTax: round(ptAnnual),
      totalDeductions: round(totalDeductionsAnnual),
      netInHand: round(netInHandAnnual),
    },
    monthly: {
      basic: round(basicAnnual / 12),
      hra: round(hraAnnual / 12),
      specialAllowance: round(specialAllowanceAnnual / 12),
      gross: round(grossAnnual / 12),
      pfEmployer: round(pfEmployerAnnual / 12),
      pfEmployee: round(pfEmployeeAnnual / 12),
      professionalTax: round(ptAnnual / 12),
      totalDeductions: round(totalDeductionsAnnual / 12),
      netInHand: round(netInHandAnnual / 12),
    }
  };
}

export interface SalaryBreakupInput {
  basicMonthly: number;
  hraMonthly: number;
  specialAllowanceMonthly: number;
  pfEmployeeMonthly: number;
  ptMonthly: number;
  taxMonthly: number;
}

export interface SalaryBreakupResult {
  monthly: {
    gross: number;
    totalDeductions: number;
    netPay: number;
  };
  annual: {
    gross: number;
    totalDeductions: number;
    netPay: number;
  };
}

export function calculateSalaryBreakup(input: SalaryBreakupInput): SalaryBreakupResult {
  const grossMonthly = input.basicMonthly + input.hraMonthly + input.specialAllowanceMonthly;
  const totalDeductionsMonthly = input.pfEmployeeMonthly + input.ptMonthly + input.taxMonthly;
  const netPayMonthly = grossMonthly - totalDeductionsMonthly;

  const round = (val: number) => Math.round(val * 100) / 100;

  return {
    monthly: {
      gross: round(grossMonthly),
      totalDeductions: round(totalDeductionsMonthly),
      netPay: round(netPayMonthly),
    },
    annual: {
      gross: round(grossMonthly * 12),
      totalDeductions: round(totalDeductionsMonthly * 12),
      netPay: round(netPayMonthly * 12),
    }
  };
}
