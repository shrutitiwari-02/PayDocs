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
