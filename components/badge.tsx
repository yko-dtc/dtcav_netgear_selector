import type { ReactNode } from "react";

const toneClasses = {
  preferred: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  standard: "border-slate-700 bg-slate-900/70 text-slate-200",
  exception: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  core: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  warning: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  neutral: "border-slate-700 bg-slate-900/70 text-slate-300",
} as const;

type BadgeTone = keyof typeof toneClasses;

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
