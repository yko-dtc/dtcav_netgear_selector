"use client";

import type { SelectorFilters } from "@/lib/types";

interface FilterPanelProps {
  filters: SelectorFilters;
  onNumberChange: (
    key: "copperPortsNeeded" | "minimumPoeBudget" | "minimumSfpPlusCount",
    value: number,
  ) => void;
  onBooleanChange: (
    key:
      | "poeRequired"
      | "rearFacingOnly"
      | "rj45Only"
      | "multigigPreferred"
      | "allowSmallInstallException"
      | "includeCoreAggregation",
    value: boolean,
  ) => void;
  onPoeTypeChange: (value: SelectorFilters["minimumPoeType"]) => void;
  onReset: () => void;
}

function Toggle({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-900/8 bg-white/70 p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-700"
      />
      <span className="space-y-1">
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-sm text-slate-600">{description}</span>
      </span>
    </label>
  );
}

export function FilterPanel({
  filters,
  onNumberChange,
  onBooleanChange,
  onPoeTypeChange,
  onReset,
}: FilterPanelProps) {
  return (
    <aside className="rounded-[28px] border border-slate-900/10 bg-[color:var(--surface)] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-900/70">
            Filters
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-slate-950">
            Design requirements
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-slate-900/10 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-700/40 hover:text-teal-900"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-900">Required copper ports</span>
          <input
            type="number"
            min={1}
            max={96}
            value={filters.copperPortsNeeded}
            onChange={(event) =>
              onNumberChange("copperPortsNeeded", Math.max(1, Number(event.target.value) || 1))
            }
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-teal-700"
          />
        </label>

        <Toggle
          checked={filters.poeRequired}
          label="PoE required"
          description="Turn this off only for non-powered endpoint designs."
          onChange={(checked) => onBooleanChange("poeRequired", checked)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-900">Minimum PoE type</span>
            <select
              value={filters.minimumPoeType}
              disabled={!filters.poeRequired}
              onChange={(event) =>
                onPoeTypeChange(event.target.value as SelectorFilters["minimumPoeType"])
              }
              className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <option value="None">None</option>
              <option value="PoE+">PoE+</option>
              <option value="PoE++">PoE++</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-900">Minimum PoE budget (W)</span>
            <input
              type="number"
              min={0}
              step={10}
              disabled={!filters.poeRequired}
              value={filters.minimumPoeBudget}
              onChange={(event) =>
                onNumberChange("minimumPoeBudget", Math.max(0, Number(event.target.value) || 0))
              }
              className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-900">Minimum SFP+ uplink count</span>
          <input
            type="number"
            min={0}
            max={16}
            value={filters.minimumSfpPlusCount}
            onChange={(event) =>
              onNumberChange(
                "minimumSfpPlusCount",
                Math.max(0, Number(event.target.value) || 0),
              )
            }
            className="rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-700"
          />
        </label>

        <div className="grid gap-3">
          <Toggle
            checked={filters.rearFacingOnly}
            label="Rear-facing only"
            description="Prefer rear-facing RJ45 layouts unless the compact 8-port exception is explicitly allowed."
            onChange={(checked) => onBooleanChange("rearFacingOnly", checked)}
          />
          <Toggle
            checked={filters.rj45Only}
            label="RJ45 only"
            description="Exclude non-RJ45 endpoint-facing options from access recommendations."
            onChange={(checked) => onBooleanChange("rj45Only", checked)}
          />
          <Toggle
            checked={filters.multigigPreferred}
            label="Multigig preferred"
            description="Use as a soft preference only. It does not disqualify current approved models."
            onChange={(checked) => onBooleanChange("multigigPreferred", checked)}
          />
          <Toggle
            checked={filters.allowSmallInstallException}
            label="Allow small-install exception"
            description="Lets the approved front-facing 8-port model compete for 1-8 port requests."
            onChange={(checked) => onBooleanChange("allowSmallInstallException", checked)}
          />
          <Toggle
            checked={filters.includeCoreAggregation}
            label="Include core / aggregation models"
            description="Shows transport and backbone options in a separate results section."
            onChange={(checked) => onBooleanChange("includeCoreAggregation", checked)}
          />
        </div>
      </div>
    </aside>
  );
}
