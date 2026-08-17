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

  return {
    grossPay,
    totalDeductions,
    netPay,
  };
}
