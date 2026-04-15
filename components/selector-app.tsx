"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { RecommendationResults } from "@/components/recommendation-results";
import { switches } from "@/data/switches";
import { parseFilters, serializeFilters } from "@/lib/filters";
import { rankSwitches } from "@/lib/ranking";
import {
  defaultFilters,
  type PoeType,
  type SelectorDraftErrors,
  type SelectorDraftFilters,
  type SelectorFilters,
} from "@/lib/types";

interface SelectorToolProps {
  draftFilters: SelectorDraftFilters;
  errors: SelectorDraftErrors;
  appliedFilters: SelectorFilters | null;
  onNumberChange: (
    key: "copperPortsNeeded" | "minimumPoeBudget" | "minimumSfpPlusCount",
    value: string,
  ) => void;
  onBooleanChange: (key: "poeRequired", value: boolean) => void;
  onPoeTypeChange: (value: SelectorDraftFilters["minimumPoeType"]) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function SelectorTool({
  draftFilters,
  errors,
  appliedFilters,
  onNumberChange,
  onBooleanChange,
  onPoeTypeChange,
  onSubmit,
  onReset,
}: SelectorToolProps) {
  const deferredFilters = useDeferredValue(appliedFilters);
  const buckets = useMemo(
    () => (deferredFilters ? rankSwitches(switches, deferredFilters) : null),
    [deferredFilters],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(260px,22vw)_minmax(0,1fr)] xl:justify-center xl:gap-8 2xl:grid-cols-[minmax(260px,20vw)_minmax(0,1fr)]">
      <div className="xl:sticky xl:top-6 xl:self-start">
        <FilterPanel
          draftFilters={draftFilters}
          errors={errors}
          onNumberChange={onNumberChange}
          onBooleanChange={onBooleanChange}
          onPoeTypeChange={onPoeTypeChange}
          onSubmit={onSubmit}
          onReset={onReset}
        />
      </div>
      <RecommendationResults buckets={buckets} filters={deferredFilters} />
    </div>
  );
}

const filterParamKeys = [
  "copperPortsNeeded",
  "poeRequired",
  "minimumPoeType",
  "minimumPoeBudget",
  "minimumSfpPlusCount",
] as const;

const blankDraftFilters: SelectorDraftFilters = {
  copperPortsNeeded: "",
  poeRequired: true,
  minimumPoeType: "",
  minimumPoeBudget: "",
  minimumSfpPlusCount: String(defaultFilters.minimumSfpPlusCount),
};

type ParsedNumberResult =
  | { success: true; value: number }
  | { success: false; error: string };

type AppliedFiltersResult =
  | { success: true; filters: SelectorFilters; errors: SelectorDraftErrors }
  | { success: false; errors: SelectorDraftErrors };

function toDraftFilters(filters: SelectorFilters): SelectorDraftFilters {
  return {
    copperPortsNeeded: String(filters.copperPortsNeeded),
    poeRequired: filters.poeRequired,
    minimumPoeType: filters.poeRequired ? filters.minimumPoeType : "",
    minimumPoeBudget: filters.poeRequired ? String(filters.minimumPoeBudget) : "",
    minimumSfpPlusCount: String(filters.minimumSfpPlusCount),
  };
}

function hasSubmittedFilters(params: URLSearchParams) {
  return params.has("submitted") || filterParamKeys.some((key) => params.has(key));
}

function parseRequiredNumber(
  value: string,
  fieldLabel: string,
  min: number,
  max: number,
): ParsedNumberResult {
  if (value.trim() === "") {
    return { success: false, error: `Add ${fieldLabel}.` };
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return { success: false, error: `${fieldLabel} must be between ${min} and ${max}.` };
  }

  return { success: true, value: parsed };
}

function parseOptionalNumber(
  value: string,
  fieldLabel: string,
  min: number,
  max: number,
): ParsedNumberResult {
  if (value.trim() === "") {
    return { success: true, value: min };
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return { success: false, error: `${fieldLabel} must be between ${min} and ${max}.` };
  }

  return { success: true, value: parsed };
}

function buildAppliedFilters(draftFilters: SelectorDraftFilters): AppliedFiltersResult {
  const errors: SelectorDraftErrors = {};
  const copperPortsNeeded = parseRequiredNumber(
    draftFilters.copperPortsNeeded,
    "the number of copper ports needed",
    1,
    96,
  );
  const minimumSfpPlusCount = parseOptionalNumber(
    draftFilters.minimumSfpPlusCount,
    "Minimum SFP+ uplink count",
    0,
    16,
  );

  if (!copperPortsNeeded.success) {
    errors.copperPortsNeeded = copperPortsNeeded.error;
  }

  if (!minimumSfpPlusCount.success) {
    errors.minimumSfpPlusCount = minimumSfpPlusCount.error;
  }

  let minimumPoeType: PoeType = "None";
  let minimumPoeBudget = 0;

  if (draftFilters.poeRequired) {
    if (draftFilters.minimumPoeType === "") {
      errors.minimumPoeType = "Choose a minimum PoE type.";
    } else {
      minimumPoeType = draftFilters.minimumPoeType;
    }

    const parsedBudget = parseRequiredNumber(
      draftFilters.minimumPoeBudget,
      "the minimum PoE budget",
      0,
      10000,
    );

    if (!parsedBudget.success) {
      errors.minimumPoeBudget = parsedBudget.error;
    } else {
      minimumPoeBudget = parsedBudget.value;
    }
  }

  if (Object.keys(errors).length > 0 || !copperPortsNeeded.success || !minimumSfpPlusCount.success) {
    return { success: false, errors };
  }

  return {
    success: true,
    filters: {
      copperPortsNeeded: copperPortsNeeded.value,
      poeRequired: draftFilters.poeRequired,
      minimumPoeType,
      minimumPoeBudget,
      minimumSfpPlusCount: minimumSfpPlusCount.value,
    },
    errors: {},
  };
}

export function SelectorApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);
  const submitted = useMemo(() => hasSubmittedFilters(params), [params]);

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString()), defaultFilters),
    [searchParams],
  );
  const [draftFilters, setDraftFilters] = useState<SelectorDraftFilters>(() =>
    submitted ? toDraftFilters(filters) : blankDraftFilters,
  );
  const [errors, setErrors] = useState<SelectorDraftErrors>({});

  useEffect(() => {
    setDraftFilters(submitted ? toDraftFilters(filters) : blankDraftFilters);
    setErrors({});
  }, [filters, submitted]);

  function updateFilters(nextFilters: SelectorFilters | null) {
    const nextParams = nextFilters ? serializeFilters(nextFilters, defaultFilters) : new URLSearchParams();

    if (nextFilters) {
      nextParams.set("submitted", "true");
    }

    const queryString = nextParams.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  function handleNumberChange(
    key: "copperPortsNeeded" | "minimumPoeBudget" | "minimumSfpPlusCount",
    value: string,
  ) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[key];
      return nextErrors;
    });
  }

  function handlePoeTypeChange(value: SelectorDraftFilters["minimumPoeType"]) {
    setDraftFilters((current) => ({ ...current, minimumPoeType: value }));
    setErrors((current) => {
      if (!current.minimumPoeType) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.minimumPoeType;
      return nextErrors;
    });
  }

  function handlePoeRequiredChange(value: boolean) {
    setDraftFilters((current) => ({ ...current, poeRequired: value }));

    if (value) {
      return;
    }

    setErrors((current) => {
      const nextErrors = { ...current };
      delete nextErrors.minimumPoeType;
      delete nextErrors.minimumPoeBudget;
      return nextErrors;
    });
  }

  function handleSubmit() {
    const nextState = buildAppliedFilters(draftFilters);

    if (!nextState.success) {
      setErrors(nextState.errors);
      return;
    }

    setErrors({});
    updateFilters(nextState.filters);
  }

  function handleReset() {
    setDraftFilters(blankDraftFilters);
    setErrors({});
    updateFilters(null);
  }

  return (
    <SelectorTool
      draftFilters={draftFilters}
      errors={errors}
      appliedFilters={submitted ? filters : null}
      onNumberChange={handleNumberChange}
      onBooleanChange={(_, value) => handlePoeRequiredChange(value)}
      onPoeTypeChange={handlePoeTypeChange}
      onSubmit={handleSubmit}
      onReset={handleReset}
    />
  );
}
