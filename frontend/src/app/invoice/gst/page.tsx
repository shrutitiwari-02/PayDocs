"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { calculateGST, GstInput, GstResult } from '@paydocs/shared';
import { Calculator, ArrowRight, Percent } from 'lucide-react';

import { CurrencySelect } from '@/components/CurrencySelect';

export default function GstCalculator() {
  const [amount, setAmount] = useState<number>(1000);
  const [rate, setRate] = useState<number>(18);
  const [mode, setMode] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [currencySymbol, setCurrencySymbol] = useState<string>('₹');

  const input: GstInput = { amount: amount || 0, rate, mode };
  const result: GstResult = calculateGST(input);

  const formatCurrency = (val: number) => {
    return currencySymbol + ' ' + val.toFixed(2);
  };

  const gstRates = [5, 12, 18, 28];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
            <Percent className="w-8 h-8 mr-3 text-teal-600" /> GST Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Calculate GST Inclusive or Exclusive amounts instantly.
          </p>
        </div>
        <div className="shrink-0 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Select Currency:</span>
          <CurrencySelect value={currencySymbol} onChange={setCurrencySymbol} label="" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <Card className="shadow-lg border-teal-100 dark:border-teal-900/30">
            <CardHeader className="bg-teal-50/50 dark:bg-teal-900/10 border-b flex flex-row items-center justify-between space-y-0">
              <CardTitle>Calculation Details</CardTitle>
              <CurrencySelect value={currencySymbol} onChange={setCurrencySymbol} />
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'exclusive' ? 'bg-white dark:bg-slate-700 shadow text-teal-700 dark:text-teal-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  onClick={() => setMode('exclusive')}
                >
                  Add GST (Exclusive)
                </button>
                <button 
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'inclusive' ? 'bg-white dark:bg-slate-700 shadow text-teal-700 dark:text-teal-300' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  onClick={() => setMode('inclusive')}
                >
                  Remove GST (Inclusive)
                </button>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                  <Input 
                    type="number" 
                    className="pl-8 text-lg font-medium"
                    value={amount || ''} 
                    onChange={e => setAmount(Number(e.target.value))} 
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {mode === 'exclusive' ? 'Enter the net amount before GST' : 'Enter the total amount including GST'}
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">GST Rate</Label>
                <div className="grid grid-cols-4 gap-2">
                  {gstRates.map(r => (
                    <Button 
                      key={r}
                      variant={rate === r ? 'default' : 'outline'}
                      className={rate === r ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setRate(r)}
                    >
                      {r}%
                    </Button>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right Column: Result */}
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white shadow-xl overflow-hidden relative h-full flex flex-col">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <CardHeader className="pb-0 pt-8 px-8 relative z-10">
              <p className="text-teal-400 font-medium mb-1 text-sm uppercase tracking-wider">
                {mode === 'exclusive' ? 'Total Gross Amount' : 'Original Net Amount'}
              </p>
              <h2 className="text-5xl font-bold tracking-tight text-white mb-2">
                {formatCurrency(mode === 'exclusive' ? result.grossAmount : result.netAmount)}
              </h2>
            </CardHeader>
            
            <CardContent className="p-8 relative z-10 flex-1 flex flex-col justify-end">
              <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 backdrop-blur-sm space-y-4">
                
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span className="text-slate-400">Net Amount</span>
                  <span className="font-medium text-lg">{formatCurrency(result.netAmount)}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">CGST ({rate / 2}%)</span>
                    <span className="text-teal-300 font-medium text-sm">+{formatCurrency(result.cgst)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="text-slate-400 text-sm">SGST ({rate / 2}%)</span>
                    <span className="text-teal-300 font-medium text-sm">+{formatCurrency(result.sgst)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="font-semibold text-slate-200">Gross Amount</span>
                  <span className="font-bold text-xl text-teal-400">{formatCurrency(result.grossAmount)}</span>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
