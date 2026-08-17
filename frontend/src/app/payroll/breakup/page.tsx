"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateSalaryBreakup, SalaryBreakupInput, SalaryBreakupResult } from '@paydocs/shared';
import { Calculator } from 'lucide-react';

export default function SalaryBreakupCalculator() {
  const [input, setInput] = useState<SalaryBreakupInput>({
    basicMonthly: 50000,
    hraMonthly: 25000,
    specialAllowanceMonthly: 15000,
    pfEmployeeMonthly: 6000,
    ptMonthly: 200,
    taxMonthly: 5000
  });

  const result: SalaryBreakupResult = calculateSalaryBreakup(input);
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleChange = (field: keyof SalaryBreakupInput, value: number) => {
    setInput(prev => ({ ...prev, [field]: value || 0 }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
          <Calculator className="w-8 h-8 mr-3 text-emerald-600" /> Salary Breakup Calculator
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Input your monthly salary components and deductions to calculate your exact net pay.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-lg border-emerald-100 dark:border-emerald-900/30">
            <CardHeader className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b">
              <CardTitle>Earnings (Monthly)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Basic Salary</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                  <Input type="number" className="pl-8" value={input.basicMonthly || ''} onChange={e => handleChange('basicMonthly', Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>House Rent Allowance (HRA)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                  <Input type="number" className="pl-8" value={input.hraMonthly || ''} onChange={e => handleChange('hraMonthly', Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Special Allowance</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                  <Input type="number" className="pl-8" value={input.specialAllowanceMonthly || ''} onChange={e => handleChange('specialAllowanceMonthly', Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-red-100 dark:border-red-900/30">
            <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b">
              <CardTitle>Deductions (Monthly)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Employee PF</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                  <Input type="number" className="pl-8" value={input.pfEmployeeMonthly || ''} onChange={e => handleChange('pfEmployeeMonthly', Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Professional Tax</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                  <Input type="number" className="pl-8" value={input.ptMonthly || ''} onChange={e => handleChange('ptMonthly', Number(e.target.value))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Income Tax / TDS</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                  <Input type="number" className="pl-8" value={input.taxMonthly || ''} onChange={e => handleChange('taxMonthly', Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-slate-900 text-white shadow-xl overflow-hidden relative">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
            <CardContent className="p-8 text-center relative z-10">
              <p className="text-emerald-400 font-medium mb-2 text-lg uppercase tracking-wider">Net Monthly Take-Home</p>
              <h2 className="text-6xl font-bold tracking-tight text-white mb-4">
                {formatCurrency(result.monthly.netPay)}
              </h2>
              <div className="flex justify-center gap-4 text-sm text-slate-300">
                <span className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">Gross: {formatCurrency(result.monthly.gross)}</span>
                <span className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">Deductions: {formatCurrency(result.monthly.totalDeductions)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Annual Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Annual Gross Salary</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(result.annual.gross)}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                  <div>
                    <p className="text-sm text-red-500 font-medium">Annual Deductions</p>
                    <p className="text-xl font-bold text-red-700 dark:text-red-400">{formatCurrency(result.annual.totalDeductions)}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                  <div>
                    <p className="text-sm text-emerald-600 font-medium">Annual Net Take-Home</p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(result.annual.netPay)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
