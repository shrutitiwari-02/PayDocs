export interface PayItem {
  id: string;
  name: string;
  amount: number;
}

export interface PayslipInput {
  basic: number;
  hra: number;
  allowances: PayItem[];
  deductions: PayItem[];
}

export interface PayslipResult {
  grossPay: number;
  totalDeductions: number;
  netPay: number;
}

export function calculatePayslip(input: PayslipInput): PayslipResult {
  const { basic, hra, allowances, deductions } = input;
  const totalAllowances = (allowances || []).reduce((sum, item) => sum + (item?.amount || 0), 0);
  const grossPay = (basic || 0) + (hra || 0) + totalAllowances;
  const totalDeductions = (deductions || []).reduce((sum, item) => sum + (item?.amount || 0), 0);
  const netPay = grossPay - totalDeductions;
  return { grossPay, totalDeductions, netPay };
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceInput {
  items: InvoiceItem[];
  taxPercentage: number;
  discountAmount?: number;
}

export interface InvoiceResult {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
}

export function calculateInvoice(input: InvoiceInput): InvoiceResult {
  const { items, taxPercentage, discountAmount = 0 } = input;
  const subtotal = (items || []).reduce((sum, item) => sum + ((item?.quantity || 0) * (item?.rate || 0)), 0);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const taxAmount = (discountedSubtotal * taxPercentage) / 100;
  const grandTotal = discountedSubtotal + taxAmount;
  return { subtotal, discountAmount, taxAmount, grandTotal };
}

export interface GstInput {
  amount: number;
  rate: number;
  mode: 'exclusive' | 'inclusive';
}

export interface GstResult {
  netAmount: number;
  gstAmount: number;
  cgst: number;
  sgst: number;
  grossAmount: number;
}

export function calculateGST(input: GstInput): GstResult {
  const { amount, rate, mode } = input;
  let netAmount = 0;
  let gstAmount = 0;
  let grossAmount = 0;

  if (mode === 'exclusive') {
    netAmount = amount;
    gstAmount = amount * (rate / 100);
    grossAmount = netAmount + gstAmount;
  } else {
    grossAmount = amount;
    gstAmount = amount - (amount * (100 / (100 + rate)));
    netAmount = grossAmount - gstAmount;
  }

  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;
  const round = (val: number) => Math.round(val * 100) / 100;

  return {
    netAmount: round(netAmount),
    gstAmount: round(gstAmount),
    cgst: round(cgst),
    sgst: round(sgst),
    grossAmount: round(grossAmount)
  };
}

export interface CtcInput {
  annualCtc: number;
  isMetro: boolean;
  pfCapped?: boolean;
  ptAnnual?: number;
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
  const basicAnnual = annualCtc * 0.50;
  const hraAnnual = basicAnnual * (isMetro ? 0.50 : 0.40);
  const pfCapped = input.pfCapped !== false;
  let pfEmployerAnnual = basicAnnual * 0.12;
  let pfEmployeeAnnual = basicAnnual * 0.12;
  if (pfCapped) {
    pfEmployerAnnual = Math.min(pfEmployerAnnual, 21600);
    pfEmployeeAnnual = Math.min(pfEmployeeAnnual, 21600);
  }
  const ptAnnual = input.ptAnnual ?? 2500;
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
