import React from 'react';
import type { QuotationTemplate1Props } from './QuotationTemplate1';

export function QuotationTemplate2({
  input,
  result,
  companyName,
  clientName,
  QUOTATIONNumber,
  issueDate,
  dueDate,
  currencySymbol = '₹'
}: QuotationTemplate1Props) {
  return (
    <div className="bg-slate-900 p-8 max-w-4xl mx-auto font-sans text-slate-100 shadow-2xl rounded-xl border border-slate-800" style={{ width: '800px' }}>
      <div className="flex justify-between items-end border-b border-slate-800 pb-8 mb-8 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">{companyName ? companyName.charAt(0) : 'C'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{companyName || 'Company Name'}</h1>
        </div>
        <div className="text-right relative z-10">
          <h2 className="text-3xl font-black text-indigo-400 tracking-widest uppercase mb-1">QUOTATION</h2>
          <div className="inline-block px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs font-mono mb-2">
            #{QUOTATIONNumber || 'INV-0001'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10 bg-slate-800/30 p-6 rounded-lg border border-slate-700/50">
        <div>
          <span className="text-slate-400 text-xs uppercase tracking-wider block mb-2">Billed To</span>
          <span className="font-semibold text-lg text-white block">{clientName || 'Client Name'}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-right">
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Issue Date</span>
            <span className="font-medium text-slate-200">{issueDate || 'YYYY-MM-DD'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Valid Until</span>
            <span className="font-medium text-slate-200">{dueDate || 'YYYY-MM-DD'}</span>
          </div>
        </div>
      </div>

      <div className="mb-10 rounded-lg overflow-hidden border border-slate-700/50 bg-slate-800/20">
        <table className="w-full text-left">
          <thead className="bg-slate-800/80 text-indigo-300 text-xs uppercase tracking-wider">
            <tr>
              <th className="py-4 px-5 font-semibold">Description</th>
              <th className="py-4 px-5 font-semibold text-center">Qty</th>
              <th className="py-4 px-5 font-semibold text-right">Price</th>
              <th className="py-4 px-5 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50 text-sm">
            {input.items?.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-5 text-slate-200">{item.description}</td>
                <td className="py-4 px-5 text-center text-slate-300">{item.quantity}</td>
                <td className="py-4 px-5 text-right text-slate-300">{currencySymbol} {item.rate.toFixed(2)}</td>
                <td className="py-4 px-5 text-right font-medium text-white">{currencySymbol} {(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mb-8">
        <div className="w-72 bg-slate-800/40 rounded-lg border border-slate-700/50 p-5 space-y-3">
          <div className="flex justify-between text-slate-300 text-sm">
            <span>Subtotal</span>
            <span>{currencySymbol} {result.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300 text-sm">
            <span>Tax ({input.taxPercentage}%)</span>
            <span>{currencySymbol} {result.taxAmount.toFixed(2)}</span>
          </div>
          {(input.discountAmount ?? 0) > 0 && (
            <div className="flex justify-between text-emerald-400 text-sm">
              <span>Discount</span>
              <span>- {currencySymbol} {(input.discountAmount ?? 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-2xl pt-4 mt-2 border-t border-slate-700 text-white">
            <span>Total</span>
            <span className="text-indigo-400">{currencySymbol} {result.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p className="text-slate-400 mb-1 font-medium">Thank you for your business!</p>
        <p>Please pay within the Valid Until to avoid late fees. Generated securely by PayDocs.</p>
      </div>
    </div>
  );
}
