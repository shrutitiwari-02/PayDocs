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
    // Add GST to the amount
    netAmount = amount;
    gstAmount = amount * (rate / 100);
    grossAmount = netAmount + gstAmount;
  } else {
    // Remove GST from the amount
    grossAmount = amount;
    gstAmount = amount - (amount * (100 / (100 + rate)));
    netAmount = grossAmount - gstAmount;
  }

  // CGST and SGST are always half of total GST each
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
