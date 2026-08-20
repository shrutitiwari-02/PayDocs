"use client";
import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Info, Lock, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * A sleek, SaaS-grade banner that politely informs guest users
 * that generated documents will not be saved to their dashboard unless signed in.
 */
export function GuestSaveNotice({ documentType = "document" }: { documentType?: string }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  // If already signed in, render success status banner
  if (session?.user) {
    return (
      <div className="mb-6 p-3 px-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 transition-all">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Logged in as <strong className="font-semibold">{session.user.name || session.user.email}</strong>. This {documentType} will be automatically recorded in your <Link href="/dashboard" className="underline font-bold hover:text-emerald-900 dark:hover:text-emerald-100">My Documents</Link> history.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-violet-50/90 dark:from-slate-900 dark:via-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-800 dark:text-slate-200 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-bold text-sm">
          💡
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Guest Mode Notice
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            You can generate and download this {documentType} freely! However, it <strong className="font-semibold text-slate-900 dark:text-white">will not be saved</strong> to your <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">My Documents</Link> dashboard unless you are logged in.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <Link href="/login">
          <Button variant="ghost" size="sm" className="h-8 px-3 text-xs font-semibold hover:bg-blue-100/60 dark:hover:bg-blue-900/40">
            Log In
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm" className="h-8 px-3 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xs">
            Sign Up
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

/**
 * Small inline helper badge to place near download buttons.
 */
export function SaveStatusBadge({ documentType = "document" }: { documentType?: string }) {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Auto-saving to My Documents
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
      <Info className="w-3.5 h-3.5" />
      <Link href="/login" className="underline hover:text-amber-700 dark:hover:text-amber-300 font-semibold">
        Sign in
      </Link>
      to save this {documentType} in your history
    </span>
  );
}
