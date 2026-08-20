"use client";
import React from "react";
import { Check, Sparkles } from "lucide-react";

export type TemplateId = "1" | "2" | "3";

interface TemplateOption {
  id: TemplateId;
  name: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  accentColor: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: "1",
    name: "Corporate Classic",
    subtitle: "Formal & structured layout",
    tag: "Standard",
    tagColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    accentColor: "#3b82f6",
  },
  {
    id: "2",
    name: "Modern Slate",
    subtitle: "High-contrast dark banner",
    tag: "Executive",
    tagColor: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700",
    accentColor: "#0f172a",
  },
  {
    id: "3",
    name: "Clean Minimalist",
    subtitle: "Monochrome & spacious",
    tag: "Editorial",
    tagColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    accentColor: "#64748b",
  },
];

interface VisualTemplateSelectorProps {
  selectedTemplate: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
  brandAccent?: "blue" | "indigo";
}

export function VisualTemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  brandAccent = "blue",
}: VisualTemplateSelectorProps) {
  const activeRing =
    brandAccent === "indigo"
      ? "ring-2 ring-indigo-600 border-indigo-600 dark:border-indigo-500 shadow-md shadow-indigo-500/10"
      : "ring-2 ring-blue-600 border-blue-600 dark:border-blue-500 shadow-md shadow-blue-500/10";

  const checkBg = brandAccent === "indigo" ? "bg-indigo-600 text-white" : "bg-blue-600 text-white";

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Document Style Template
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          Click to live preview
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;

          return (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`relative flex flex-col p-2.5 rounded-xl border text-left transition-all duration-200 outline-none group ${
                isSelected
                  ? `bg-slate-50/90 dark:bg-slate-800/80 ${activeRing}`
                  : "bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
              }`}
            >
              {/* Checkmark badge */}
              {isSelected && (
                <div
                  className={`absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full ${checkBg} flex items-center justify-center shadow-xs z-10`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              {/* Mini Document Silhouette Thumbnail */}
              <div className="w-full h-16 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 flex flex-col justify-between mb-2 shadow-2xs group-hover:scale-[1.02] transition-transform">
                {/* Header representation */}
                {tmpl.id === "1" && (
                  <>
                    <div className="h-2 w-full rounded bg-blue-500" />
                    <div className="space-y-1 my-auto">
                      <div className="h-1 w-3/4 rounded bg-slate-300 dark:bg-slate-700" />
                      <div className="h-1 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="h-1.5 w-1/3 rounded bg-blue-200 dark:bg-blue-900 self-end" />
                  </>
                )}

                {tmpl.id === "2" && (
                  <>
                    <div className="h-3 w-full rounded bg-slate-900 dark:bg-slate-100 flex items-center px-1">
                      <div className="h-1 w-1/3 rounded bg-white dark:bg-slate-900" />
                    </div>
                    <div className="space-y-1 my-auto">
                      <div className="h-1 w-full rounded bg-slate-300 dark:bg-slate-700" />
                      <div className="h-1 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="h-1.5 w-full rounded bg-slate-800 dark:bg-slate-200" />
                  </>
                )}

                {tmpl.id === "3" && (
                  <>
                    <div className="flex justify-between items-center pb-1 border-b border-slate-200 dark:border-slate-800">
                      <div className="h-1 w-1/3 rounded bg-slate-400 dark:bg-slate-600" />
                      <div className="h-1 w-1/4 rounded bg-slate-300 dark:bg-slate-700" />
                    </div>
                    <div className="space-y-1 my-auto">
                      <div className="h-1 w-full rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-1 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                    <div className="h-1 w-1/2 rounded bg-slate-400 dark:bg-slate-600 self-end" />
                  </>
                )}
              </div>

              {/* Title & Tag */}
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                  {tmpl.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {tmpl.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
