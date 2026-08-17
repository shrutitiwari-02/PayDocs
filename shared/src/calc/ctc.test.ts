import { calculateCTC, CtcInput, CtcResult, calculateSalaryBreakup, SalaryBreakupInput, SalaryBreakupResult } from './ctc';

describe('CTC Calculation', () => {
  it('should calculate CTC correctly for Metro', () => {
    const input: CtcInput = {
      annualCtc: 1200000,
      isMetro: true,
      pfCapped: false,
    };

    const result: CtcResult = calculateCTC(input);

    expect(result.annual.basic).toBe(600000);
    expect(result.annual.hra).toBe(300000);
    expect(result.annual.pfEmployer).toBe(72000);
    expect(result.annual.specialAllowance).toBe(228000); // 1200000 - 600000 - 300000 - 72000
    expect(result.annual.gross).toBe(1128000);
    expect(result.annual.professionalTax).toBe(2500);
    expect(result.annual.pfEmployee).toBe(72000);
    expect(result.annual.totalDeductions).toBe(74500);
    expect(result.annual.netInHand).toBe(1053500); // 1128000 - 74500
  });

  it('should calculate Salary Breakup correctly', () => {
    const input: SalaryBreakupInput = {
      basicMonthly: 50000,
      hraMonthly: 25000,
      specialAllowanceMonthly: 15000,
      pfEmployeeMonthly: 6000,
      ptMonthly: 200,
      taxMonthly: 5000,
    };

    const result: SalaryBreakupResult = calculateSalaryBreakup(input);

    expect(result.monthly.gross).toBe(90000);
    expect(result.monthly.totalDeductions).toBe(11200);
    expect(result.monthly.netPay).toBe(78800);
  });
});
