import React from 'react';
import type { Template1Props } from './Template1';

export function Template2({
  input,
  result,
  companyName,
  employeeName,
  employeeId,
  designation,
  department,
  payPeriod
}: Template1Props) {
  return (
    <div className="bg-slate-900 p-8 max-w-4xl mx-auto font-sans text-slate-100 shadow-2xl rounded-xl border border-slate-800" style={{ width: '800px' }}>
      <div className="flex justify-between items-end border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="w-12 h-12 bg-gradient-to-tr from-teal-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">{companyName.charAt(0)}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{companyName || 'Company Name'}</h1>
        </div>
        <div className="text-right">
          <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold mb-2 uppercase tracking-wider">
            Payslip
          </div>
          <p className="text-slate-400 text-sm">Period: <span className="text-white font-medium">{payPeriod || 'YYYY-MM'}</span></p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-5 grid grid-cols-4 gap-4 mb-8 border border-slate-700/50">
        <div>
          <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Employee Name</span>
          <span className="font-medium text-white">{employeeName || 'John Doe'}</span>
        </div>
        <div>
          <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Employee ID</span>
          <span className="font-medium text-white">{employeeId || 'EMP-001'}</span>
        </div>
        <div>
          <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Designation</span>
          <span className="font-medium text-white">{designation || 'Software Engineer'}</span>
        </div>
        <div>
          <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Department</span>
          <span className="font-medium text-white">{department || 'Engineering'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700/50">
            <h3 className="font-medium text-teal-400 text-sm uppercase tracking-wider">Earnings</h3>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Basic Salary</span>
              <span className="text-white">₹ {input.basic.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">House Rent Allowance (HRA)</span>
              <span className="text-white">₹ {input.hra.toFixed(2)}</span>
            </div>
            {input.allowances?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-slate-300">{item.name}</span>
                <span className="text-white">₹ {item.amount.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-medium mt-4 pt-4 border-t border-slate-700/50 text-white">
              <span>Total Earnings</span>
              <span>₹ {result.grossPay.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700/50">
            <h3 className="font-medium text-rose-400 text-sm uppercase tracking-wider">Deductions</h3>
          </div>
          <div className="p-4 space-y-3 text-sm">
            {input.deductions?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-slate-300">{item.name}</span>
                <span className="text-white">₹ {item.amount.toFixed(2)}</span>
              </div>
            ))}
            {input.deductions.length === 0 && (
              <div className="text-slate-500 italic text-center py-2">No deductions</div>
            )}
            <div className="flex justify-between font-medium mt-4 pt-4 border-t border-slate-700/50 text-white">
              <span>Total Deductions</span>
              <span>₹ {result.totalDeductions.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-lg p-6 flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl -ml-8 -mb-8"></div>
        <div className="relative z-10">
          <p className="text-teal-400 font-medium uppercase tracking-wider text-sm mb-1">Net Pay</p>
          <p className="text-xs text-slate-400">Gross Earnings - Total Deductions</p>
        </div>
        <div className="relative z-10 text-4xl font-bold text-white tracking-tight">
          ₹ {result.netPay.toFixed(2)}
        </div>
      </div>
      
      <div className="mt-10 text-center text-xs text-slate-500">
        <p>This is a system generated payslip and does not require a physical signature.</p>
        <p className="mt-1 text-slate-600">Generated securely by PayDocs</p>
      </div>
    </div>
  );
}
