import React from 'react';
import type { InvoiceTemplate1Props } from './InvoiceTemplate1';

export function InvoiceTemplate3({
  input,
  result,
  companyName,
  clientName,
  invoiceNumber,
  issueDate,
  dueDate,
  currencySymbol = '₹'
}: InvoiceTemplate1Props) {
  return (
    <div className="bg-white p-12 max-w-4xl mx-auto font-mono text-black border border-black" style={{ width: '800px' }}>
      <div className="text-center mb-12 pb-8 border-b-2 border-black">
        <h1 className="text-4xl font-bold uppercase tracking-widest">{companyName || 'Company Name'}</h1>
        <p className="mt-4 text-2xl tracking-widest">TAX INVOICE</p>
        <p className="text-sm mt-2">REF: {invoiceNumber || 'INV-0001'}</p>
      </div>

      <div className="mb-12">
        <table className="w-full text-left border-collapse">
          <tbody>
            <tr>
              <td className="py-3 border-b border-gray-300 w-1/4 font-bold uppercase">Billed To</td>
              <td className="py-3 border-b border-gray-300 font-bold text-lg" colSpan={3}>{clientName || 'Client Name'}</td>
            </tr>
            <tr>
              <td className="py-3 border-b border-gray-300 w-1/4 font-bold uppercase">Issue Date</td>
              <td className="py-3 border-b border-gray-300 w-1/4">{issueDate || 'YYYY-MM-DD'}</td>
              <td className="py-3 border-b border-gray-300 w-1/4 font-bold uppercase">Due Date</td>
              <td className="py-3 border-b border-gray-300 w-1/4 font-bold">{dueDate || 'YYYY-MM-DD'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="py-3 border-b-2 border-black uppercase tracking-wider">Item Description</th>
              <th className="py-3 border-b-2 border-black uppercase tracking-wider text-center">Qty</th>
              <th className="py-3 border-b-2 border-black uppercase tracking-wider text-right">Unit Price</th>
              <th className="py-3 border-b-2 border-black uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {input.items?.map((item) => (
              <tr key={item.id}>
                <td className="py-4 border-b border-gray-300">{item.description}</td>
                <td className="py-4 border-b border-gray-300 text-center">{item.quantity}</td>
                <td className="py-4 border-b border-gray-300 text-right">{currencySymbol} {item.rate.toFixed(2)}</td>
                <td className="py-4 border-b border-gray-300 text-right font-bold">{currencySymbol} {(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-12">
        <table className="w-1/2 text-left border-collapse">
          <tbody>
            <tr>
              <td className="py-2 font-bold uppercase">Subtotal</td>
              <td className="py-2 text-right">{currencySymbol} {result.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-2 font-bold uppercase">Tax ({input.taxPercentage}%)</td>
              <td className="py-2 text-right">{currencySymbol} {result.taxAmount.toFixed(2)}</td>
            </tr>
            {(input.discountAmount ?? 0) > 0 && (
              <tr>
                <td className="py-2 font-bold uppercase">Discount</td>
                <td className="py-2 text-right">- {currencySymbol} {(input.discountAmount ?? 0).toFixed(2)}</td>
              </tr>
            )}
            <tr>
              <td className="py-4 mt-2 border-t-2 border-black font-bold uppercase text-xl">Total Amount</td>
              <td className="py-4 mt-2 border-t-2 border-black font-bold text-right text-2xl">{currencySymbol} {result.grandTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="text-center text-xs uppercase tracking-widest border-t border-black pt-6">
        <p className="font-bold">THANK YOU FOR YOUR BUSINESS</p>
        <p className="mt-1 text-gray-500">PAYMENT IS DUE WITHIN THE AGREED TERMS</p>
      </div>
    </div>
  );
}
