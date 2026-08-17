export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceInput {
  items: InvoiceItem[];
  taxPercentage: number; // e.g., 18 for 18%
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

  const subtotal = (items || []).reduce((sum, item) => {
    return sum + ((item?.quantity || 0) * (item?.rate || 0));
  }, 0);

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  
  const taxAmount = (discountedSubtotal * taxPercentage) / 100;
  
  const grandTotal = discountedSubtotal + taxAmount;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal,
  };
}
