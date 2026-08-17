import { calculatePayslip } from './payslip';

describe('calculatePayslip', () => {
  it('should correctly calculate gross pay, total deductions, and net pay', () => {
    const input = {
      basic: 50000,
      hra: 20000,
      allowances: [
        { id: '1', name: 'Transport Allowance', amount: 3000 },
        { id: '2', name: 'Special Allowance', amount: 7000 },
      ],
      deductions: [
        { id: '1', name: 'PF', amount: 6000 },
        { id: '2', name: 'TDS', amount: 5000 },
      ],
    };

    const result = calculatePayslip(input);

    expect(result.grossPay).toBe(80000); // 50000 + 20000 + 10000
    expect(result.totalDeductions).toBe(11000); // 6000 + 5000
    expect(result.netPay).toBe(69000); // 80000 - 11000
  });

  it('should handle zero allowances and deductions', () => {
    const input = {
      basic: 40000,
      hra: 10000,
      allowances: [],
      deductions: [],
    };

    const result = calculatePayslip(input);

    expect(result.grossPay).toBe(50000);
    expect(result.totalDeductions).toBe(0);
    expect(result.netPay).toBe(50000);
  });

  it('should gracefully handle missing allowances and deductions arrays', () => {
    const input = {
      basic: 50000,
      hra: 20000
    } as any; 

    const result = calculatePayslip(input);

    expect(result.grossPay).toBe(70000);
    expect(result.totalDeductions).toBe(0);
    expect(result.netPay).toBe(70000);
  });
});
