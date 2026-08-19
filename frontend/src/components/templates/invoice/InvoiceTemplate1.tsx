import React from 'react';
import type { InvoiceResult, InvoiceInput } from '@paydocs/shared';

export interface InvoiceTemplate1Props {
  input: InvoiceInput;
  result: InvoiceResult;
  companyName: string;
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currencySymbol?: string;
}

export function InvoiceTemplate1({
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
    <div className="bg-white p-8 max-w-4xl mx-auto font-sans text-slate-800" style={{ width: '800px' }}>
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{companyName || 'Company Name'}</h1>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold text-indigo-600 tracking-wider">INVOICE</h2>
          <p className="text-slate-500 mt-1"># {invoiceNumber || 'INV-0001'}</p>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <div>
          <span className="text-slate-500 text-sm block mb-1">Bill To:</span>
          <span className="font-semibold text-lg">{clientName || 'Client Name'}</span>
        </div>
        <div className="text-right flex gap-8">
          <div>
            <span className="text-slate-500 text-sm block">Issue Date</span>
            <span className="font-semibold">{issueDate || 'YYYY-MM-DD'}</span>
          </div>
          <div>
            <span className="text-slate-500 text-sm block">Due Date</span>
            <span className="font-semibold">{dueDate || 'YYYY-MM-DD'}</span>
          </div>
        </div>
      </div>

      <div className="mb-8 border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-sm">
            <tr>
              <th className="py-3 px-4 font-semibold">Description</th>
              <th className="py-3 px-4 font-semibold text-center">Quantity</th>
              <th className="py-3 px-4 font-semibold text-right">Unit Price</th>
              <th className="py-3 px-4 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {input.items?.map((item) => (
              <tr key={item.id}>
                <td className="py-4 px-4">{item.description}</td>
                <td className="py-4 px-4 text-center">{item.quantity}</td>
                <td className="py-4 px-4 text-right">{currencySymbol} {item.rate.toFixed(2)}</td>
                <td className="py-4 px-4 text-right font-medium">{currencySymbol} {(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{currencySymbol} {result.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax ({input.taxPercentage}%)</span>
            <span>{currencySymbol} {result.taxAmount.toFixed(2)}</span>
          </div>
          {(input.discountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>- {currencySymbol} {(input.discountAmount ?? 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-xl pt-3 border-t-2 border-slate-800">
            <span>Total</span>
            <span className="text-indigo-600">{currencySymbol} {result.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
        <p className="font-semibold text-slate-700 mb-1">Thank you for your business!</p>
        <p>Please pay within the due date to avoid late fees.</p>
      </div>
    </div>
  );
}
