"use client";

import type { SelectorFilters } from "@/lib/types";

interface FilterPanelProps {
  filters: SelectorFilters;
  onNumberChange: (
    key: "copperPortsNeeded" | "minimumPoeBudget" | "minimumSfpPlusCount",
    value: number,
  ) => void;
  onBooleanChange: (key: "poeRequired", value: boolean) => void;
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
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-400 focus:ring-sky-500"
      />
      <span className="space-y-1">
        <span className="block text-sm font-semibold text-slate-100">{label}</span>
        <span className="block text-sm text-slate-400">{description}</span>
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
    <aside className="rounded-[32px] border border-slate-800 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-200/60">
            Quick inputs
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[1.65rem] font-semibold tracking-tight text-slate-50">
            Narrow the request
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
        >
          Reset
        </button>
      </div>

      <p className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm leading-6 text-slate-300">
        Rear-facing RJ45 access switches are shown by default. For very small rooms,
        the approved compact 8-port exception is considered automatically.
      </p>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-100">Copper ports needed</span>
          <input
            type="number"
            min={1}
            max={96}
            value={filters.copperPortsNeeded}
            onChange={(event) =>
              onNumberChange("copperPortsNeeded", Math.max(1, Number(event.target.value) || 1))
            }
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none ring-0 transition placeholder:text-slate-500 focus:border-sky-400"
          />
        </label>

        <Toggle
          checked={filters.poeRequired}
          label="PoE required"
          description="Turn this off only for non-powered endpoint designs."
          onChange={(checked) => onBooleanChange("poeRequired", checked)}
        />

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-100">Minimum PoE type</span>
            <select
              value={filters.minimumPoeType}
              disabled={!filters.poeRequired}
              onChange={(event) =>
                onPoeTypeChange(event.target.value as SelectorFilters["minimumPoeType"])
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-900/60 disabled:text-slate-500"
            >
              <option value="None">None</option>
              <option value="PoE+">PoE+</option>
              <option value="PoE++">PoE++</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-100">Minimum PoE budget (W)</span>
            <input
              type="number"
              min={0}
              step={10}
              disabled={!filters.poeRequired}
              value={filters.minimumPoeBudget}
              onChange={(event) =>
                onNumberChange("minimumPoeBudget", Math.max(0, Number(event.target.value) || 0))
              }
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-900/60 disabled:text-slate-500"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-100">Minimum SFP+ uplink count</span>
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
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400"
          />
        </label>
      </div>
    </aside>
  );
}
