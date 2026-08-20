"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, Sparkles, TrendingUp, Wallet, Landmark, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LiveSalaryWidget() {
  const [annualCTC, setAnnualCTC] = useState<number>(85000);

  // Dynamic calculations
  const basic = Math.round(annualCTC * 0.5);
  const hra = Math.round(annualCTC * 0.2);
  const allowances = Math.round(annualCTC * 0.15);
  const deductions = Math.round(annualCTC * 0.15);
  const netAnnual = annualCTC - deductions;
  const monthlyInHand = Math.round(netAnnual / 12);

  const formatUsd = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-blue-900/90 via-indigo-950/95 to-slate-950 p-6 sm:p-10 border border-blue-500/20 shadow-2xl text-white overflow-hidden">
      
      {/* Background glow orb */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left column: Slider & Title */}
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Compensation Estimator</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            See how your compensation breaks down in real-time.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Drag the slider to adjust annual Cost to Company (CTC) and inspect your projected monthly in-hand take-home salary instantly.
          </p>

          {/* Interactive Slider Input */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-slate-400">Annual Gross CTC</span>
              <span className="text-xl font-extrabold text-blue-400 font-mono">
                {formatUsd(annualCTC)} / year
              </span>
            </div>

            <input
              type="range"
              min={25000}
              max={250000}
              step={5000}
              value={annualCTC}
              onChange={(e) => setAnnualCTC(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />

            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>$25,000</span>
              <span>$125,000</span>
              <span>$250,000+</span>
            </div>
          </div>
        </div>

        {/* Right column: Dynamic Visual Breakdown Cards */}
        <div className="w-full lg:w-1/2 space-y-4">
          
          {/* Main Monthly In-Hand Highlight */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-violet-600/30 border border-blue-400/30 backdrop-blur-md flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-500/40">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block">
                  Estimated Monthly In-Hand
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {formatUsd(monthlyInHand)}
                  <span className="text-sm font-normal text-slate-300"> / mo</span>
                </span>
              </div>
            </div>

            <Link href="/payroll/ctc">
              <Button size="sm" className="hidden sm:flex font-bold bg-white text-slate-950 hover:bg-slate-100 rounded-xl shadow-xs">
                Detailed CTC
              </Button>
            </Link>
          </div>

          {/* Breakdown Mini Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Basic Pay */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Basic (50%)</span>
              </div>
              <div className="font-extrabold text-base text-white font-mono">
                {formatUsd(basic)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Base Taxable</div>
            </div>

            {/* HRA & Perks */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>HRA & Perks</span>
              </div>
              <div className="font-extrabold text-base text-white font-mono">
                {formatUsd(hra + allowances)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Housing & Bonus</div>
            </div>

            {/* Deductions & Tax */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Deductions</span>
              </div>
              <div className="font-extrabold text-base text-white font-mono">
                -{formatUsd(deductions)}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">PF, TDS & Tax</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link href="/payslip/single" className="w-full sm:flex-1">
              <Button className="w-full font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25">
                Generate Full Slip for This Salary
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/payroll/breakup" className="w-full sm:w-auto">
              <Button className="w-full font-bold bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-xl shadow-xs transition-colors">
                Salary Breakup Tool
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
