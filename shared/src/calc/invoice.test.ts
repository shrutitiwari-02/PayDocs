import { calculateInvoice } from './invoice';

describe('calculateInvoice', () => {
  it('should correctly calculate subtotal, tax amount, and grand total', () => {
    const input = {
      items: [
        { id: '1', description: 'Web Development', quantity: 2, rate: 5000 },
        { id: '2', description: 'Hosting', quantity: 1, rate: 1000 },
      ],
      taxPercentage: 10,
    };

    const result = calculateInvoice(input);

    expect(result.subtotal).toBe(11000); // 10000 + 1000
    expect(result.discountAmount).toBe(0);
    expect(result.taxAmount).toBe(1100); // 10% of 11000
    expect(result.grandTotal).toBe(12100); // 11000 + 1100
  });

  it('should correctly apply discounts before calculating tax', () => {
    const input = {
      items: [
        { id: '1', description: 'Design Services', quantity: 1, rate: 20000 },
      ],
      taxPercentage: 18,
      discountAmount: 5000,
    };

    const result = calculateInvoice(input);

    expect(result.subtotal).toBe(20000);
    expect(result.discountAmount).toBe(5000);
    // discountedSubtotal = 15000
    expect(result.taxAmount).toBe(2700); // 18% of 15000
    expect(result.grandTotal).toBe(17700); // 15000 + 2700
  });

  it('should handle zero items', () => {
    const input = {
      items: [],
      taxPercentage: 5,
    };

    const result = calculateInvoice(input);

    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });

  it('should gracefully handle missing items array without throwing', () => {
    const input = {
      taxPercentage: 18
    } as any;

    const result = calculateInvoice(input);

    expect(result.subtotal).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.grandTotal).toBe(0);
  });
});
