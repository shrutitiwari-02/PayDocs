import React from 'react';
import type { PayslipResult, PayslipInput } from '@paydocs/shared';

// For generating the PDF, we might pass in the calculated result.
export interface Template1Props {
  input: PayslipInput;
  result: PayslipResult;
  companyName: string;
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  payPeriod: string;
  currencySymbol?: string;
}

export function Template1({
  input,
  result,
  companyName,
  employeeName,
  employeeId,
  designation,
  department,
  payPeriod,
  currencySymbol = '₹'
}: Template1Props) {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto font-sans text-slate-800" style={{ width: '800px' }}>
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{companyName || 'Company Name'}</h1>
          <p className="text-slate-500 mt-1">Payslip for the period {payPeriod || 'YYYY-MM'}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-blue-600">PAYSLIP</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
        <div>
          <span className="text-slate-500 text-sm block">Employee Name</span>
          <span className="font-semibold">{employeeName || 'John Doe'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-sm block">Employee ID</span>
          <span className="font-semibold">{employeeId || 'EMP-001'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-sm block">Designation</span>
          <span className="font-semibold">{designation || 'Software Engineer'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-sm block">Department</span>
          <span className="font-semibold">{department || 'Engineering'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Earnings */}
        <div>
          <h3 className="font-bold border-b border-slate-200 pb-2 mb-3 text-slate-900">Earnings</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Basic Salary</span>
              <span>{currencySymbol} {input.basic.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>House Rent Allowance (HRA)</span>
              <span>{currencySymbol} {input.hra.toFixed(2)}</span>
            </div>
            {input.allowances?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span>{currencySymbol} {item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold mt-4 pt-2 border-t border-slate-200">
            <span>Total Earnings</span>
            <span>{currencySymbol} {result.grossPay.toFixed(2)}</span>
          </div>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="font-bold border-b border-slate-200 pb-2 mb-3 text-slate-900">Deductions</h3>
          <div className="space-y-2 text-sm">
            {input.deductions?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name}</span>
                <span>{currencySymbol} {item.amount.toFixed(2)}</span>
              </div>
            ))}
            {input.deductions.length === 0 && (
              <div className="text-slate-400 italic">No deductions</div>
            )}
          </div>
          <div className="flex justify-between font-bold mt-4 pt-2 border-t border-slate-200">
            <span>Total Deductions</span>
            <span>{currencySymbol} {result.totalDeductions.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex justify-between items-center">
        <div>
          <p className="text-slate-500 text-sm">Net Pay</p>
          <p className="text-xs text-slate-400 mt-1">(Gross Earnings - Total Deductions)</p>
        </div>
        <div className="text-3xl font-bold text-blue-600">
          {currencySymbol} {result.netPay.toFixed(2)}
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
        This is a system generated payslip and does not require a physical signature.
      </div>
    </div>
  );
}
