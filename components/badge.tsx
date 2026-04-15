import type { ReactNode } from "react";

const toneClasses = {
  preferred: "border-teal-700/20 bg-teal-700/10 text-teal-900",
  standard: "border-slate-900/10 bg-white/80 text-slate-700",
  exception: "border-amber-600/20 bg-amber-100 text-amber-900",
  core: "border-sky-700/20 bg-sky-100 text-sky-900",
  warning: "border-rose-700/20 bg-rose-100 text-rose-900",
  neutral: "border-slate-900/10 bg-slate-900/5 text-slate-700",
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

