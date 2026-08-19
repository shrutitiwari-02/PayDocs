import React from 'react';

export interface ReceiptProps {
  receiptNumber: string;
  date: string;
  receivedFrom: string;
  amount: number;
  paymentMode: string;
  description: string;
  companyName: string;
  currencySymbol?: string;
}

export const ReceiptTemplate: React.FC<ReceiptProps> = ({
  receiptNumber,
  date,
  receivedFrom,
  amount,
  paymentMode,
  description,
  companyName,
  currencySymbol = '₹'
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto p-12 bg-white text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{companyName}</h2>
          <p className="text-slate-500 mt-2">Payment Receipt</p>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-black text-indigo-600 tracking-tight uppercase">RECEIPT</h1>
          <p className="text-slate-500 mt-2 font-medium"># {receiptNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Received From:</p>
          <p className="text-xl font-medium text-slate-900">{receivedFrom}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Date:</p>
          <p className="text-xl font-medium text-slate-900">{date}</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-8 mb-12 border border-slate-100">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
          <span className="text-slate-500 font-medium">Payment Mode</span>
          <span className="font-semibold text-slate-900">{paymentMode}</span>
        </div>
        <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
          <span className="text-slate-500 font-medium">For</span>
          <span className="font-semibold text-slate-900">{description}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-900 font-bold text-xl">Amount Received</span>
          <span className="text-3xl font-black text-indigo-600">{currencySymbol} {amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-16 text-center border-t border-slate-200 pt-8">
        <p className="text-slate-400 text-sm">
          Thank you for your business. This is a computer generated receipt and does not require a physical signature.
        </p>
      </div>
    </div>
  );
};
