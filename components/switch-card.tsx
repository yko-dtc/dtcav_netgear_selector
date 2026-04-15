"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [modalImageFailed, setModalImageFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dialogId = useMemo(
    () => model.model.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    [model.model],
  );

  useEffect(() => {
    if (!isOpen) {
      document.body.dataset.modalOpen = "false";
      return;
    }

    document.body.dataset.modalOpen = "true";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.dataset.modalOpen = "false";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const cardAccent =
    variant === "recommended"
      ? "border-sky-300/15 bg-slate-950/70 shadow-[0_24px_80px_rgba(2,6,23,0.5)]"
      : variant === "core"
        ? "border-sky-400/15 bg-slate-950/65 shadow-[0_18px_60px_rgba(3,105,161,0.18)]"
        : "border-slate-800 bg-slate-950/60 shadow-[0_18px_60px_rgba(2,6,23,0.4)]";

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
    <>
      <article className={`overflow-hidden rounded-[28px] border backdrop-blur-xl ${cardAccent}`}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`View details for ${model.model}`}
          className="w-full cursor-pointer p-4 text-left transition hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 sm:p-5"
        >
          <div className="space-y-4">
            <div className="relative aspect-[7/1] w-full overflow-hidden rounded-[24px] border border-slate-800 bg-[linear-gradient(135deg,#0f172a,#172554)]">
              {imageFailed ? (
                <div className="flex h-full items-center justify-center px-4 text-center text-[11px] font-medium leading-4 text-slate-400">
                  Image coming soon
                </div>
              ) : (
                <Image
                  src={model.image}
                  alt={model.model}
                  fill
                  sizes="(min-width: 1024px) 460px, (min-width: 640px) 520px, 100vw"
                  className="object-contain p-3 sm:p-4"
                  onError={() => setImageFailed(true)}
                  unoptimized
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    {getBadgeConfig(model).map((badge) => (
                      <Badge key={badge.label} tone={badge.tone}>
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="mt-3 truncate font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-slate-50">
                    {model.model}
                  </h3>
                  <p className="mt-1 truncate text-sm text-slate-400">
                    {model.series} | SKU {model.sku}
                  </p>
                </div>
                <span className="mt-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  View Details
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-2 text-left">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Ports
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-100">{copperLabel}</dd>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Uplinks
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-100">{model.sfpPlus10G}x SFP+</dd>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    PoE
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-100">{model.poeType}</dd>
                </div>
              </dl>
            </div>
          </div>
        </button>
      </article>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/78 px-3 py-6 backdrop-blur-md sm:px-4"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            className="max-h-[92vh] w-full max-w-[min(94vw,110rem)] overflow-y-auto rounded-[32px] border border-slate-800 bg-slate-950 shadow-[0_40px_120px_rgba(2,6,23,0.75)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-800 bg-slate-950/95 px-5 py-5 backdrop-blur xl:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {getBadgeConfig(model).map((badge) => (
                    <Badge key={badge.label} tone={badge.tone}>
                      {badge.label}
                    </Badge>
                  ))}
                </div>
                <h3
                  id={`${dialogId}-title`}
                  className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl"
                >
                  {model.model}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  {model.series} | SKU {model.sku}
                  {model.taaSku ? ` | TAA ${model.taaSku}` : ""}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="shrink-0 rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 px-5 py-5 xl:px-6 xl:py-6">
              <div className="relative aspect-[6/1] min-h-[180px] w-full overflow-hidden rounded-[30px] border border-slate-800 bg-[linear-gradient(135deg,#0f172a,#172554)] sm:min-h-[220px] xl:min-h-[280px]">
                {modalImageFailed ? (
                  <div className="flex h-full items-center justify-center px-6 text-center">
                    <div>
                      <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-100">
                        Image coming soon
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        Drop `{model.image.replace("/switch-images/", "")}` into `public/switch-images/`.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={model.image}
                    alt={model.model}
                    fill
                    sizes="(min-width: 1536px) 1280px, (min-width: 1280px) 1180px, 100vw"
                    className="object-contain p-4 sm:p-6 xl:p-8"
                    onError={() => setModalImageFailed(true)}
                    unoptimized
                  />
                )}
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                <div className="space-y-4">
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Copper profile
                      </dt>
                      <dd className="mt-2 text-lg font-semibold text-slate-100">{copperLabel}</dd>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        SFP+ uplinks
                      </dt>
                      <dd className="mt-2 text-lg font-semibold text-slate-100">{model.sfpPlus10G}x</dd>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        PoE budget
                      </dt>
                      <dd className="mt-2 text-lg font-semibold text-slate-100">
                        {model.poeType} | {model.poeBudgetBaseWatts}W base / {model.poeBudgetMaxWatts}W max
                      </dd>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Layout
                      </dt>
                      <dd className="mt-2 text-lg font-semibold capitalize text-slate-100">
                        {model.orientation}
                      </dd>
                    </div>
                  </dl>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {insightLabel}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                      {matchReasons.map((reason) => (
                        <li key={reason}>- {reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Watch-outs
                    </p>
                    {watchOuts.length > 0 ? (
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                        {watchOuts.map((warning) => (
                          <li key={warning}>- {warning}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-slate-400">No special watch-outs on this model.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      At a glance
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{model.portProfile}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCopy()}
                    className="w-full rounded-full border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                  >
                    {copied ? "Copied summary" : "Copy summary"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
