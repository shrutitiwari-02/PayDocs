"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, ArrowRight, PieChart } from 'lucide-react';
import { calculateCTC, CtcResult } from '@paydocs/shared';

export default function CtcCalculator() {
  const [annualCtc, setAnnualCtc] = useState<number>(1200000);
  const [isMetro, setIsMetro] = useState<boolean>(true);
  
  const result: CtcResult = calculateCTC({ annualCtc, isMetro });
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const chartData = [
    { name: 'Basic', value: result.monthly.basic, color: '#3b82f6' },
    { name: 'HRA', value: result.monthly.hra, color: '#10b981' },
    { name: 'Special Allowance', value: result.monthly.specialAllowance, color: '#8b5cf6' },
  ];

  const deductionData = [
    { name: 'EPF (Employee)', value: result.monthly.pfEmployee, color: '#ef4444' },
    { name: 'Prof. Tax', value: result.monthly.professionalTax, color: '#f59e0b' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
          <PieChart className="w-8 h-8 mr-3 text-indigo-600" /> CTC to In-Hand Calculator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Calculate your estimated monthly take-home salary based on your annual Cost to Company (CTC).
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-lg border-indigo-100 dark:border-indigo-900/30">
            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/10 border-b">
              <CardTitle>Salary Details</CardTitle>
              <CardDescription>Enter your annual CTC to get started.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Annual CTC (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                  <Input 
                    type="number" 
                    className="pl-8 text-lg font-medium"
                    value={annualCtc || ''} 
                    onChange={e => setAnnualCtc(Number(e.target.value))} 
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <div>
                  <Label className="text-base font-semibold">Metro City?</Label>
                  <p className="text-xs text-slate-500 mt-1">Affects HRA calculation (50% vs 40%)</p>
                </div>
                <input type="checkbox" checked={isMetro} onChange={e => setIsMetro(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-indigo-600 text-white shadow-xl overflow-hidden relative">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <CardContent className="p-8 text-center relative z-10">
              <p className="text-indigo-100 font-medium mb-2 text-lg">Estimated Monthly In-Hand</p>
              <h2 className="text-5xl font-bold tracking-tight">
                {formatCurrency(result.monthly.netInHand)}
              </h2>
              <p className="text-sm text-indigo-200 mt-4 bg-indigo-700/50 inline-block px-3 py-1 rounded-full">
                Gross: {formatCurrency(result.monthly.gross)} / month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 dark:border-slate-800">
                      <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400">Component</th>
                      <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Monthly</th>
                      <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Annually</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4">Basic Salary</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(result.monthly.basic)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatCurrency(result.annual.basic)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4">House Rent Allowance (HRA)</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(result.monthly.hra)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatCurrency(result.annual.hra)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4">Special Allowance</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(result.monthly.specialAllowance)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">{formatCurrency(result.annual.specialAllowance)}</td>
                    </tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-semibold border-y-2 border-slate-200 dark:border-slate-700">
                      <td className="py-4 px-4 text-indigo-700 dark:text-indigo-300">Gross Salary (A)</td>
                      <td className="py-4 px-4 text-right text-indigo-700 dark:text-indigo-300">{formatCurrency(result.monthly.gross)}</td>
                      <td className="py-4 px-4 text-right text-indigo-700/70 dark:text-indigo-300/70">{formatCurrency(result.annual.gross)}</td>
                    </tr>
                    
                    <tr>
                      <td colSpan={3} className="py-4 px-4 text-sm font-bold text-slate-400 uppercase tracking-wider">Deductions</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4">Employee PF (12% of Basic)</td>
                      <td className="py-3 px-4 text-right font-medium text-red-600 dark:text-red-400">- {formatCurrency(result.monthly.pfEmployee)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">- {formatCurrency(result.annual.pfEmployee)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-3 px-4">Professional Tax</td>
                      <td className="py-3 px-4 text-right font-medium text-red-600 dark:text-red-400">- {formatCurrency(result.monthly.professionalTax)}</td>
                      <td className="py-3 px-4 text-right text-slate-500">- {formatCurrency(result.annual.professionalTax)}</td>
                    </tr>
                    <tr className="bg-red-50/50 dark:bg-red-900/10 font-semibold border-y-2 border-slate-200 dark:border-slate-700">
                      <td className="py-4 px-4 text-red-700 dark:text-red-400">Total Deductions (B)</td>
                      <td className="py-4 px-4 text-right text-red-700 dark:text-red-400">- {formatCurrency(result.monthly.totalDeductions)}</td>
                      <td className="py-4 px-4 text-right text-red-700/70 dark:text-red-400/70">- {formatCurrency(result.annual.totalDeductions)}</td>
                    </tr>

                    <tr className="bg-indigo-50 dark:bg-indigo-900/20 text-lg font-bold border-b-2 border-indigo-200 dark:border-indigo-800">
                      <td className="py-5 px-4 text-indigo-900 dark:text-indigo-100">Net In-Hand (A - B)</td>
                      <td className="py-5 px-4 text-right text-indigo-900 dark:text-indigo-100">{formatCurrency(result.monthly.netInHand)}</td>
                      <td className="py-5 px-4 text-right text-indigo-700 dark:text-indigo-300">{formatCurrency(result.annual.netInHand)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/50 text-sm italic text-slate-500">
                      <td className="py-3 px-4">Employer PF (12% of Basic, part of CTC)</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(result.monthly.pfEmployer)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(result.annual.pfEmployer)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
