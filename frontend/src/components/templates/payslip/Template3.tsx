import React from 'react';
import type { Template1Props } from './Template1';

export function Template3({
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
    <div className="bg-white p-12 max-w-4xl mx-auto font-mono text-black border border-black" style={{ width: '800px' }}>
      <div className="text-center mb-10 pb-6 border-b-2 border-black">
        <h1 className="text-4xl font-bold uppercase tracking-widest">{companyName || 'Company Name'}</h1>
        <p className="mt-2 text-lg">OFFICIAL PAYSLIP</p>
        <p className="text-sm mt-1">PERIOD: {payPeriod || 'YYYY-MM'}</p>
      </div>

      <div className="mb-10">
        <table className="w-full text-left border-collapse">
          <tbody>
            <tr>
              <td className="py-2 border-b border-gray-300 w-1/4 font-bold">EMPLOYEE NAME</td>
              <td className="py-2 border-b border-gray-300 w-1/4">{employeeName || 'John Doe'}</td>
              <td className="py-2 border-b border-gray-300 w-1/4 font-bold">EMPLOYEE ID</td>
              <td className="py-2 border-b border-gray-300 w-1/4">{employeeId || 'EMP-001'}</td>
            </tr>
            <tr>
              <td className="py-2 border-b border-gray-300 font-bold">DESIGNATION</td>
              <td className="py-2 border-b border-gray-300">{designation || 'Software Engineer'}</td>
              <td className="py-2 border-b border-gray-300 font-bold">DEPARTMENT</td>
              <td className="py-2 border-b border-gray-300">{department || 'Engineering'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex justify-between gap-12 mb-10">
        <div className="w-1/2">
          <h3 className="font-bold text-lg border-b-2 border-black pb-1 mb-4 uppercase">Earnings</h3>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr>
                <td className="py-1">BASIC SALARY</td>
                <td className="py-1 text-right">{input.basic.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-1">HRA</td>
                <td className="py-1 text-right">{input.hra.toFixed(2)}</td>
              </tr>
              {input.allowances?.map((item) => (
                <tr key={item.id}>
                  <td className="py-1 uppercase">{item.name}</td>
                  <td className="py-1 text-right">{item.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-2 mt-2 border-t-2 border-black font-bold uppercase">Total Earnings</td>
                <td className="py-2 mt-2 border-t-2 border-black font-bold text-right">{result.grossPay.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="w-1/2">
          <h3 className="font-bold text-lg border-b-2 border-black pb-1 mb-4 uppercase">Deductions</h3>
          <table className="w-full text-left border-collapse">
            <tbody>
              {input.deductions?.map((item) => (
                <tr key={item.id}>
                  <td className="py-1 uppercase">{item.name}</td>
                  <td className="py-1 text-right">{item.amount.toFixed(2)}</td>
                </tr>
              ))}
              {input.deductions.length === 0 && (
                <tr>
                  <td className="py-1 italic" colSpan={2}>No deductions</td>
                </tr>
              )}
              <tr>
                <td className="py-2 mt-2 border-t-2 border-black font-bold uppercase">Total Deductions</td>
                <td className="py-2 mt-2 border-t-2 border-black font-bold text-right">{result.totalDeductions.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-4 border-black p-6 flex justify-between items-center mb-12">
        <div className="font-bold text-xl uppercase tracking-widest">
          Net Pay
        </div>
        <div className="text-3xl font-bold">
          {result.netPay.toFixed(2)} INR
        </div>
      </div>
      
      <div className="text-center text-xs uppercase tracking-widest border-t border-black pt-4">
        *** SYSTEM GENERATED DOCUMENT - NO SIGNATURE REQUIRED ***
      </div>
    </div>
  );
}
