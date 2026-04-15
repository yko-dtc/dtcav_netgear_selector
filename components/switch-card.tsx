"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/badge";
import type { SwitchModel } from "@/lib/types";

interface SwitchCardProps {
  model: SwitchModel;
  matchReasons?: string[];
  watchOuts?: string[];
  summary?: string;
  variant?: "recommended" | "alternate" | "catalog" | "core";
  insightLabel?: string;
}

function getBadgeConfig(model: SwitchModel) {
  const badges = [];

  if (model.standardTier === "preferred") {
    badges.push({ label: "Preferred", tone: "preferred" as const });
  }

  if (model.standardTier === "standard") {
    badges.push({ label: "Standard", tone: "standard" as const });
  }

  if (model.standardTier === "exception") {
    badges.push({ label: "Small Install Exception", tone: "exception" as const });
  }

  if (model.category === "core_aggregation") {
    badges.push({ label: "Core / Aggregation", tone: "core" as const });
  }

  if (model.orientation === "rear-facing") {
    badges.push({ label: "Rear-Facing", tone: "neutral" as const });
  }

  if (model.poeType === "PoE++") {
    badges.push({ label: "PoE++", tone: "warning" as const });
  }

  return badges;
}

export function SwitchCard({
  model,
  matchReasons = [],
  watchOuts = [],
  summary,
  variant = "alternate",
  insightLabel = "Why this matched",
}: SwitchCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardAccent =
    variant === "recommended"
      ? "border-teal-800/20 shadow-[0_24px_70px_rgba(13,110,100,0.12)]"
      : variant === "core"
        ? "border-sky-700/20 shadow-[0_18px_55px_rgba(14,116,144,0.08)]"
        : "border-slate-900/10 shadow-[0_18px_55px_rgba(15,23,42,0.06)]";

  async function handleCopy() {
    if (!summary) {
      return;
    }

    await navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const accessCopper = model.copper1G + model.copperMultigig;
  const copperLabel =
    accessCopper > 0 ? `${accessCopper} copper` : `${model.copper10G} copper 10G`;

  return (
    <article className={`overflow-hidden rounded-[28px] border bg-[color:var(--surface-strong)] ${cardAccent}`}>
      <div className="relative h-48 overflow-hidden border-b border-slate-900/8 bg-[linear-gradient(135deg,rgba(15,118,110,0.12),rgba(255,255,255,0.5))]">
        {imageFailed ? (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900">
                Image coming soon
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Drop `{model.image.replace("/switch-images/", "")}` into `public/switch-images/`.
              </p>
            </div>
          </div>
        ) : (
          <Image
            src={model.image}
            alt={model.model}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain p-6"
            onError={() => setImageFailed(true)}
            unoptimized
          />
        )}
      </div>

      <div className="space-y-5 p-5">
        <div className="flex flex-wrap gap-2">
          {getBadgeConfig(model).map((badge) => (
            <Badge key={badge.label} tone={badge.tone}>
              {badge.label}
            </Badge>
          ))}
        </div>

        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-950">
                {model.model}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {model.series} | SKU {model.sku}
                {model.taaSku ? ` | TAA ${model.taaSku}` : ""}
              </p>
            </div>
            {summary ? (
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="rounded-full border border-slate-900/10 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-700/40 hover:text-teal-900"
              >
                {copied ? "Copied summary" : "Copy summary"}
              </button>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{model.portProfile}</p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-900/8 bg-white/75 p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Copper profile
            </dt>
            <dd className="mt-2 text-lg font-semibold text-slate-900">{copperLabel}</dd>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-white/75 p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              SFP+ uplinks
            </dt>
            <dd className="mt-2 text-lg font-semibold text-slate-900">{model.sfpPlus10G}x</dd>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-white/75 p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              PoE
            </dt>
            <dd className="mt-2 text-lg font-semibold text-slate-900">
              {model.poeType} | {model.poeBudgetBaseWatts}W base / {model.poeBudgetMaxWatts}W max
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-900/8 bg-white/75 p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Orientation
            </dt>
            <dd className="mt-2 text-lg font-semibold capitalize text-slate-900">
              {model.orientation}
            </dd>
          </div>
        </dl>

        {matchReasons.length > 0 ? (
          <div className="rounded-2xl border border-teal-800/12 bg-teal-900/[0.04] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-900/70">
              {insightLabel}
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              {matchReasons.map((reason) => (
                <li key={reason}>- {reason}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {watchOuts.length > 0 ? (
          <div className="rounded-2xl border border-amber-700/15 bg-amber-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-900/75">
              Watch-outs
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950">
              {watchOuts.map((warning) => (
                <li key={warning}>- {warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
