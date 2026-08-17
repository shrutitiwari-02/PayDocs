"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  Receipt,
  Calculator,
  Wrench,
  ChevronDown
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Suppress marketing navbar on dedicated auth pages
  if (pathname === "/login" || pathname === "/signup") return null;

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) return name.slice(0, 2).toUpperCase();
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
          <img
            src="/logo-transparent.png"
            alt="PayDocs Logo"
            className="h-10 w-auto object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
          />
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            PayDocs
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            href="/#payroll"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all"
          >
            Payroll Tools
          </Link>
          <Link
            href="/#invoicing"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all"
          >
            Invoicing
          </Link>
          <Link
            href="/#utilities"
            className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all"
          >
            PDF Utilities
          </Link>
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${pathname === "/dashboard"
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 font-bold"
                : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70"
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            My Documents
          </Link>
        </div>

        {/* Right CTAs / User Profile */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  {getInitials(session.user.name, session.user.email)}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                  {session.user.name || session.user.email}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-lg"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 rounded-lg transition-all"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 py-5 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-1">
            <Link
              href="/#payroll"
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Payroll Tools
            </Link>
            <Link
              href="/#invoicing"
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Invoicing & Billing
            </Link>
            <Link
              href="/#utilities"
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              PDF Utilities
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-2.5 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/50 transition-colors flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="w-4 h-4" />
              My Documents Dashboard
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {session?.user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Signed in as <strong className="text-slate-900 dark:text-white">{session.user.name || session.user.email}</strong>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-semibold">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
