import { DisqualifiedList } from "@/components/disqualified-list";
import { SwitchCard } from "@/components/switch-card";
import { getRecommendationBanner } from "@/lib/ranking";
import type { RecommendationBuckets, SelectorFilters } from "@/lib/types";

interface RecommendationResultsProps {
  buckets: RecommendationBuckets;
  filters: SelectorFilters;
}

export function RecommendationResults({
  buckets,
  filters,
}: RecommendationResultsProps) {
  const bestMatch = buckets.recommended[0];

  return (
    <div className="space-y-5">
      <section className="rounded-[32px] border border-slate-800 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/60">
          Selector logic
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{getRecommendationBanner(filters)}</p>
      </section>

      {buckets.guidance ? (
        <section className="rounded-[32px] border border-slate-800 bg-slate-950/60 p-5 text-slate-100">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/60">
            Notes
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{buckets.guidance}</p>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/60">
            Best match
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-tight text-slate-50">
            Recommended
          </h2>
        </div>

        {bestMatch ? (
          <SwitchCard
            model={bestMatch.switch}
            matchReasons={bestMatch.matchReasons}
            watchOuts={bestMatch.watchOuts}
            summary={bestMatch.summary}
            variant="recommended"
            isSuitable
          />
        ) : (
          <div className="rounded-[32px] border border-slate-800 bg-slate-950/70 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-50">
              No approved access switch matches every hard requirement.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Try lowering the PoE budget, reducing the SFP+ requirement, or increasing
              the acceptable port size.
            </p>
          </div>
        )}
      </section>

      {buckets.alternates.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/60">
              Alternates
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-[2rem] font-semibold tracking-tight text-slate-50">
              Other approved fits
            </h2>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {buckets.alternates.map((result) => (
              <SwitchCard
                key={result.switch.model}
                model={result.switch}
                matchReasons={result.matchReasons}
                watchOuts={result.watchOuts}
                summary={result.summary}
                variant="alternate"
                isSuitable
              />
            ))}
          </div>
        </section>
      ) : null}

      <DisqualifiedList items={buckets.disqualified} />
    </div>
  );
}
