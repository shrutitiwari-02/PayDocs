"use client";
import React from 'react';
import { Globe } from 'lucide-react';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
  decimals: number;
}

export const CURRENCIES: CurrencyConfig[] = [
  { symbol: '₹', code: 'INR', name: '₹ (INR - Indian Rupee)', decimals: 2 },
  { symbol: '$', code: 'USD', name: '$ (USD - US Dollar)', decimals: 2 },
  { symbol: '€', code: 'EUR', name: '€ (EUR - Euro)', decimals: 2 },
  { symbol: '£', code: 'GBP', name: '£ (GBP - British Pound)', decimals: 2 },
  { symbol: '¥', code: 'JPY', name: '¥ (JPY - Japanese Yen)', decimals: 0 },
  { symbol: 'A$', code: 'AUD', name: 'A$ (AUD - Australian Dollar)', decimals: 2 },
  { symbol: 'C$', code: 'CAD', name: 'C$ (CAD - Canadian Dollar)', decimals: 2 },
  { symbol: 'AED', code: 'AED', name: 'AED (UAE Dirham)', decimals: 2 },
  { symbol: 'S$', code: 'SGD', name: 'S$ (SGD - Singapore Dollar)', decimals: 2 },
];

/**
 * Accurately formats a financial amount using the selected currency symbol,
 * ensuring high mathematical precision without floating point drift.
 */
export function formatAmount(amount: number, symbol: string = '₹'): string {
  const num = Number(amount) || 0;
  const curr = CURRENCIES.find(c => c.symbol === symbol);
  const decimals = curr ? curr.decimals : 2;
  
  // Mathematical rounding to eliminate floating point issues (e.g. 70000.00000000001)
  const factor = Math.pow(10, decimals);
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;

  const formattedStr = rounded.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol} ${formattedStr}`;
}

export interface CurrencySelectProps {
  value: string;
  onChange: (symbol: string) => void;
  className?: string;
  label?: string;
}

export function CurrencySelect({ value, onChange, className = '', label = 'Currency' }: CurrencySelectProps) {
  return (
    <div className={`inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xs ${className}`}>
      <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
      {label && (
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          {label}:
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-indigo-700 dark:text-indigo-300 text-xs font-extrabold outline-none cursor-pointer pr-1"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.symbol} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
