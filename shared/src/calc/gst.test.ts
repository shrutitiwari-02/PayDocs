import { calculateGST, GstInput, GstResult } from './gst';

describe('GST Calculation', () => {
  it('should calculate exclusive GST correctly', () => {
    const input: GstInput = {
      amount: 1000,
      rate: 18,
      mode: 'exclusive',
    };

    const result: GstResult = calculateGST(input);

    expect(result.netAmount).toBe(1000);
    expect(result.gstAmount).toBe(180);
    expect(result.cgst).toBe(90);
    expect(result.sgst).toBe(90);
    expect(result.grossAmount).toBe(1180);
  });

  it('should calculate inclusive GST correctly', () => {
    const input: GstInput = {
      amount: 1180,
      rate: 18,
      mode: 'inclusive',
    };

    const result: GstResult = calculateGST(input);

    expect(result.grossAmount).toBe(1180);
    expect(result.gstAmount).toBe(180); // 1180 - (1180 * 100 / 118) = 1180 - 1000 = 180
    expect(result.netAmount).toBe(1000);
    expect(result.cgst).toBe(90);
    expect(result.sgst).toBe(90);
  });
});
