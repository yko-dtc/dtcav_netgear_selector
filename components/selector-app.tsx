"use client";

import { startTransition, useDeferredValue, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FilterPanel } from "@/components/filter-panel";
import { RecommendationResults } from "@/components/recommendation-results";
import { switches } from "@/data/switches";
import { parseFilters, serializeFilters } from "@/lib/filters";
import { rankSwitches } from "@/lib/ranking";
import { defaultFilters, type SelectorFilters } from "@/lib/types";

interface SelectorToolProps {
  filters: SelectorFilters;
  onNumberChange: (
    key: "copperPortsNeeded" | "minimumPoeBudget" | "minimumSfpPlusCount",
    value: number,
  ) => void;
  onBooleanChange: (key: "poeRequired", value: boolean) => void;
  onPoeTypeChange: (value: SelectorFilters["minimumPoeType"]) => void;
  onReset: () => void;
}

export function SelectorTool({
  filters,
  onNumberChange,
  onBooleanChange,
  onPoeTypeChange,
  onReset,
}: SelectorToolProps) {
  const deferredFilters = useDeferredValue(filters);
  const buckets = useMemo(() => rankSwitches(switches, deferredFilters), [deferredFilters]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(260px,22vw)_minmax(0,1fr)] xl:justify-center xl:gap-8 2xl:grid-cols-[minmax(260px,20vw)_minmax(0,1fr)]">
      <div className="xl:sticky xl:top-6 xl:self-start">
        <FilterPanel
          filters={filters}
          onNumberChange={onNumberChange}
          onBooleanChange={onBooleanChange}
          onPoeTypeChange={onPoeTypeChange}
          onReset={onReset}
        />
      </div>
      <RecommendationResults buckets={buckets} filters={deferredFilters} />
    </div>
  );
}

export function SelectorApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString()), defaultFilters),
    [searchParams],
  );

  function updateFilters(nextFilters: SelectorFilters) {
    const params = serializeFilters(nextFilters, defaultFilters);
    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  return (
    <SelectorTool
      filters={filters}
      onNumberChange={(key, value) => updateFilters({ ...filters, [key]: value })}
      onBooleanChange={(key, value) => updateFilters({ ...filters, [key]: value })}
      onPoeTypeChange={(value) => updateFilters({ ...filters, minimumPoeType: value })}
      onReset={() => updateFilters(defaultFilters)}
    />
  );
}
