"use client";
import React, { useState } from "react";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  FileText,
  TrendingUp,
  Building2,
  DollarSign
} from "lucide-react";

export function HeroDocumentShowcase() {
  const [activeTab, setActiveTab] = useState<"invoice" | "payslip">("invoice");

  return (
    <div className="relative w-full max-w-lg mx-auto select-none">

      {/* Aurora Ambient Backlight */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-fuchsia-600/30 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity -z-10 animate-pulse" />

      {/* Floating Speed Badge (Top Left) */}
      <div className="absolute -top-4 -left-3 sm:-left-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-lg shadow-blue-500/10 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 animate-bounce [animation-duration:3s]">
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>PDF Generated in 0.4s</span>
      </div>

      {/* Floating Security Badge (Bottom Right) */}
      <div className="absolute -bottom-4 -right-3 sm:-right-6 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-lg shadow-emerald-500/10 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Verified Hash & Sign</span>
      </div>

      {/* Main Glass Document Container */}
      <div className="relative rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-7 transition-all duration-300 hover:shadow-blue-500/15">

        {/* Toggle between Invoice and Payslip Preview */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <img src="/logo-transparent.png" alt="PayDocs Logo" className="h-8 w-auto object-contain shrink-0" />
            <div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                Acme Technologies Inc.
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Official Document Engine
              </span>
            </div>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("invoice")}
              className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === "invoice"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              Invoice
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("payslip")}
              className={`px-2.5 py-1 rounded-lg transition-all ${activeTab === "payslip"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              Payslip
            </button>
          </div>
        </div>

        {/* ── PREVIEW CONTENT ──────────────────────────────────────────────── */}
        {activeTab === "invoice" ? (
          <div className="space-y-4">

            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Billed To
                </span>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Starlight Digital Studio
                </div>
                <div className="text-xs text-slate-400">client@starlight.io</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  PAID
                </span>
                <div className="text-[11px] font-mono text-slate-400 mt-1">INV-2026-894</div>
              </div>
            </div>

            {/* Line items mock */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center font-medium text-slate-700 dark:text-slate-300">
                <span>1× Enterprise SaaS Development</span>
                <span className="font-bold">$12,000.00</span>
              </div>
              <div className="flex justify-between items-center font-medium text-slate-700 dark:text-slate-300">
                <span>1× Dedicated Cloud Cluster Setup</span>
                <span className="font-bold">$2,850.00</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span>Tax GST (18%) included</span>
                <span>$2,673.00</span>
              </div>
            </div>

            {/* Total summary */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/60 dark:border-indigo-800/60">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200">
                  Total Amount Paid
                </span>
              </div>
              <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                $14,850.00
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Payslip Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Employee Record
                </span>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Alex Mercer (EMP-1042)
                </div>
                <div className="text-xs text-slate-400">Principal Staff Engineer</div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">
                  JULY 2026
                </span>
                <div className="text-[11px] text-slate-400 mt-1">31 Days Worked</div>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Basic Pay + HRA
                </span>
                <span className="font-bold">$8,500.00</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" /> Special Allowances
                </span>
                <span className="font-bold">$2,200.00</span>
              </div>
              <div className="flex justify-between items-center text-rose-600 dark:text-rose-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Deductions (PF & Tax)
                </span>
                <span className="font-bold">-$1,150.00</span>
              </div>
            </div>

            {/* Total Net Pay */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 border border-blue-200/60 dark:border-blue-800/60">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-xs text-blue-900 dark:text-blue-200">
                  Net In-Hand Salary
                </span>
              </div>
              <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                $9,550.00
              </div>
            </div>
          </div>
        )}

        {/* Footer Seal */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> High-DPI Vector Print Ready
          </span>
          <span className="font-mono text-[10px]">PAYDOCS-ENGINE-V2</span>
        </div>
      </div>
    </div>
  );
}
