import Link from "next/link";
import {
  Files,
  Calculator,
  Receipt,
  FileText,
  Layers,
  Scissors,
  Minimize2,
  FilePieChart,
  FileImage,
  Droplet,
  ListOrdered,
  RotateCw,
  PenTool,
  FileType2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  Flame,
  Star
} from "lucide-react";
import { HeroDocumentShowcase } from "@/components/HeroDocumentShowcase";
import { LiveSalaryWidget } from "@/components/LiveSalaryWidget";

interface ToolItem {
  name: string;
  desc: string;
  icon: any;
  href: string;
  badge?: string;
  badgeColor?: string;
  gradient: string;
}

const PAYROLL_TOOLS: ToolItem[] = [
  {
    name: "Payslip Generator",
    desc: "Generate professional company payslips with earnings, deductions, and live templates.",
    icon: FileText,
    href: "/payslip/single",
    badge: "Popular",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    gradient: "from-blue-600 via-indigo-600 to-cyan-500"
  },
  {
    name: "Bulk Payslip Engine",
    desc: "Upload Excel/CSV spreadsheets to batch-generate hundreds of employee payslips at once.",
    icon: Files,
    href: "/payslip/bulk",
    badge: "Batch Engine",
    badgeColor: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
    gradient: "from-cyan-600 to-blue-600"
  },
  {
    name: "Salary Component Breakup",
    desc: "Calculate Basic, HRA, DA, Special Allowances, and PF deductions with legal compliance.",
    icon: Calculator,
    href: "/payroll/breakup",
    gradient: "from-blue-600 to-violet-600"
  },
  {
    name: "CTC to In-Hand Estimator",
    desc: "Estimate net take-home salary and annual tax liability based on total Cost to Company.",
    icon: FilePieChart,
    href: "/payroll/ctc",
    gradient: "from-sky-500 to-indigo-600"
  },
];

const INVOICE_TOOLS: ToolItem[] = [
  {
    name: "Invoice Generator",
    desc: "Create sleek, customized business invoices with automatic tax, discounts, and custom currencies.",
    icon: Receipt,
    href: "/invoice/single",
    badge: "Essential",
    badgeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    gradient: "from-indigo-600 via-purple-600 to-fuchsia-500"
  },
  {
    name: "Bulk Invoice Dispatch",
    desc: "Generate and download bulk invoices from structured tabular client CSV datasets.",
    icon: Files,
    href: "/invoice/bulk",
    gradient: "from-purple-600 to-pink-600"
  },
  {
    name: "Quotation Generator",
    desc: "Draft professional commercial price quotes and service estimates for prospective clients.",
    icon: FileText,
    href: "/quotation",
    gradient: "from-fuchsia-600 to-indigo-600"
  },
  {
    name: "Payment Receipt Generator",
    desc: "Create and issue verifiable payment acknowledgement receipts in seconds.",
    icon: FileText,
    href: "/receipt",
    gradient: "from-indigo-500 to-violet-500"
  },
  {
    name: "GST Tax Calculator",
    desc: "Compute GST inclusive and exclusive tax amounts across all standard tax slabs.",
    icon: Calculator,
    href: "/invoice/gst",
    gradient: "from-violet-600 to-purple-600"
  },
];

const DOC_UTILITIES: ToolItem[] = [
  { name: "Merge PDF", desc: "Combine multiple PDF documents into a single cohesive file", icon: Layers, href: "/tools/pdf-merge", gradient: "from-emerald-500 to-teal-600" },
  { name: "Split PDF", desc: "Extract specific pages or separate documents effortlessly", icon: Scissors, href: "/tools/pdf-split", gradient: "from-teal-500 to-emerald-600" },
  { name: "Compress PDF", desc: "Optimize file size while maintaining pristine visual clarity", icon: Minimize2, href: "/tools/pdf-compress", gradient: "from-emerald-600 to-green-600" },
  { name: "Image to PDF", desc: "Convert PNG, JPG, and web images directly into PDF documents", icon: FileImage, href: "/tools/image-to-pdf", gradient: "from-teal-600 to-cyan-600" },
  { name: "PDF to Image", desc: "Extract high-resolution image pages from PDF documents", icon: FileImage, href: "/tools/pdf-to-image", gradient: "from-cyan-600 to-teal-600" },
  { name: "Add Watermark", desc: "Stamp custom text or confidential security markings across all pages", icon: Droplet, href: "/tools/pdf-watermark", gradient: "from-amber-500 to-orange-600" },
  { name: "Page Numbers", desc: "Automatically number and index multi-page PDF files", icon: ListOrdered, href: "/tools/pdf-page-numbers", gradient: "from-orange-500 to-amber-600" },
  { name: "Rotate PDF", desc: "Adjust page orientation by 90°, 180°, or 270° degrees", icon: RotateCw, href: "/tools/pdf-rotate", gradient: "from-amber-600 to-yellow-600" },
  { name: "Sign PDF", desc: "Draw, upload, and embed signatures securely onto documents", icon: PenTool, href: "/tools/pdf-sign", gradient: "from-rose-500 to-pink-600" },
  { name: "Word to PDF", desc: "Convert Microsoft Word .docx documents to formatted PDFs", icon: FileType2, href: "/tools/word-to-pdf", gradient: "from-blue-600 to-indigo-600" },
  { name: "PDF to Word", desc: "Transform PDFs back into editable Word document files", icon: FileType2, href: "/tools/pdf-to-word", gradient: "from-indigo-600 to-violet-600" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500 selection:text-white">

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 overflow-hidden">

        {/* Aurora Mesh Glow Layer */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] md:w-[1000px] md:h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse [animation-duration:8s]" />
        <div className="absolute top-10 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Hero Text & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">

              {/* Animated Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 border border-blue-300/60 dark:border-blue-700/60 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-bold shadow-xs hover:border-blue-400 transition-colors">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin [animation-duration:10s]" />
                <span>Next-Gen Accounting & Document Suite</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                Your entire payroll, invoicing &{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600">
                  documents in one place.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Generate verified payslips, customizable invoices, accurate tax calculations, and process PDF files with instant high-resolution vector print output.
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/payslip/single"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Generate Payslip
                </Link>
                <Link
                  href="/invoice/single"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-base shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Create Invoice
                </Link>
              </div>

              {/* Value Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Instant PDF Generator</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Auto-Saves with Account</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>Private Local Storage</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Live Document Showcase */}
            <div className="lg:col-span-5">
              <HeroDocumentShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE SALARY ESTIMATOR WIDGET ──────────────────────────────── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mb-24">
        <LiveSalaryWidget />
      </section>

      {/* ── MAIN TOOLS DIRECTORY ────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pb-28 space-y-24">

        {/* ── SECTION 1: PAYROLL SUITE ────────────────────────────────────────── */}
        <section id="payroll" className="scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                Payroll & HR Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Salary & Compensation Management
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Generate standardized payslips, calculate take-home compensation, and process batch records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PAYROLL_TOOLS.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle top card glow line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform`}>
                      <tool.icon className="w-6 h-6" />
                    </div>
                    {tool.badge && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── SECTION 2: INVOICING & BILLING ──────────────────────────────────── */}
        <section id="invoicing" className="scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Billing & Commercial
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Invoices, Quotations & Receipts
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Generate clean, formatted tax invoices and quotations with real-time tax calculation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INVOICE_TOOLS.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle top card glow line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform`}>
                      <tool.icon className="w-6 h-6" />
                    </div>
                    {tool.badge && (
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${tool.badgeColor}`}>
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── SECTION 3: PDF UTILITIES ────────────────────────────────────────── */}
        <section id="utilities" className="scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Document Toolkit
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                PDF & Conversion Utilities
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Merge, compress, watermark, sign, and convert PDF documents securely in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {DOC_UTILITIES.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="group flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-lg hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.gradient} text-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition-transform`}>
                    <tool.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {tool.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  <span>Launch</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo-transparent.png" alt="PayDocs Logo" className="h-7 w-auto object-contain shrink-0" />
            <span className="font-extrabold text-base text-slate-900 dark:text-white">PayDocs</span>
            <span className="text-xs text-slate-400">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link href="/#payroll" className="hover:text-blue-600 transition-colors">Payroll</Link>
            <Link href="/#invoicing" className="hover:text-indigo-600 transition-colors">Invoicing</Link>
            <Link href="/#utilities" className="hover:text-emerald-600 transition-colors">Utilities</Link>
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
