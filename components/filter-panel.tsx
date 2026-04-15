"use client";

import type { SelectorDraftErrors, SelectorDraftFilters } from "@/lib/types";

interface FilterPanelProps {
  draftFilters: SelectorDraftFilters;
  errors: SelectorDraftErrors;
  onNumberChange: (
    key: "copperPortsNeeded" | "minimumPoeBudget" | "minimumSfpPlusCount",
    value: string,
  ) => void;
  onBooleanChange: (key: "poeRequired", value: boolean) => void;
  onPoeTypeChange: (value: SelectorDraftFilters["minimumPoeType"]) => void;
  onSubmit: () => void;
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
  draftFilters,
  errors,
  onNumberChange,
  onBooleanChange,
  onPoeTypeChange,
  onSubmit,
  onReset,
}: FilterPanelProps) {
  return (
    <aside className="rounded-[32px] border border-slate-800 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
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

        <p className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm leading-6 text-slate-300">
          Add the room requirements, then use Find Best Match to run the selector.
          Rear-facing RJ45 access switches stay prioritized, with the approved 8-port
          exception considered automatically for very small rooms.
        </p>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-100">Copper ports needed</span>
            <input
              type="number"
              min={1}
              max={96}
              value={draftFilters.copperPortsNeeded}
              placeholder="Enter a port count"
              aria-invalid={errors.copperPortsNeeded ? "true" : "false"}
              onChange={(event) => onNumberChange("copperPortsNeeded", event.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none ring-0 transition placeholder:text-slate-500 focus:border-sky-400"
            />
            {errors.copperPortsNeeded ? (
              <span className="text-sm text-rose-300">{errors.copperPortsNeeded}</span>
            ) : null}
          </label>

          <Toggle
            checked={draftFilters.poeRequired}
            label="PoE required"
            description="Turn this off only for non-powered endpoint designs."
            onChange={(checked) => onBooleanChange("poeRequired", checked)}
          />

          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-100">Minimum PoE type</span>
              <select
                value={draftFilters.minimumPoeType}
                disabled={!draftFilters.poeRequired}
                aria-invalid={errors.minimumPoeType ? "true" : "false"}
                onChange={(event) =>
                  onPoeTypeChange(event.target.value as SelectorDraftFilters["minimumPoeType"])
                }
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-900/60 disabled:text-slate-500"
              >
                <option value="">Select minimum PoE type</option>
                <option value="PoE+">PoE+</option>
                <option value="PoE++">PoE++</option>
              </select>
              {errors.minimumPoeType ? (
                <span className="text-sm text-rose-300">{errors.minimumPoeType}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-100">Minimum PoE budget (W)</span>
              <input
                type="number"
                min={0}
                step={10}
                disabled={!draftFilters.poeRequired}
                value={draftFilters.minimumPoeBudget}
                placeholder="Enter a PoE budget"
                aria-invalid={errors.minimumPoeBudget ? "true" : "false"}
                onChange={(event) => onNumberChange("minimumPoeBudget", event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-900/60 disabled:text-slate-500"
              />
              {errors.minimumPoeBudget ? (
                <span className="text-sm text-rose-300">{errors.minimumPoeBudget}</span>
              ) : null}
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-100">Minimum SFP+ uplink count</span>
            <input
              type="number"
              min={0}
              max={16}
              value={draftFilters.minimumSfpPlusCount}
              placeholder="Optional"
              aria-invalid={errors.minimumSfpPlusCount ? "true" : "false"}
              onChange={(event) => onNumberChange("minimumSfpPlusCount", event.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400"
            />
            {errors.minimumSfpPlusCount ? (
              <span className="text-sm text-rose-300">{errors.minimumSfpPlusCount}</span>
            ) : null}
          </label>
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Find Best Match
        </button>
      </form>
    </aside>
  );
}
