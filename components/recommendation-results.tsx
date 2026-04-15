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
    <div className="space-y-6">
      <section className="rounded-[28px] border border-teal-900/15 bg-[linear-gradient(145deg,rgba(15,118,110,0.12),rgba(255,255,255,0.72))] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-900/80">
          Recommendation rule
        </p>
        <p className="mt-2 text-base text-slate-800">{getRecommendationBanner(filters)}</p>
      </section>

      {buckets.guidance ? (
        <section className="rounded-[28px] border border-sky-800/15 bg-sky-50 p-5 text-sky-950">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900/75">
            Design guidance
          </p>
          <p className="mt-2 text-sm leading-6">{buckets.guidance}</p>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-900/80">
            Best match
          </p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-950">
            Recommended switch
          </h2>
        </div>

        {bestMatch ? (
          <SwitchCard
            model={bestMatch.switch}
            matchReasons={bestMatch.matchReasons}
            watchOuts={bestMatch.watchOuts}
            summary={bestMatch.summary}
            variant="recommended"
          />
        ) : (
          <div className="rounded-[28px] border border-slate-900/10 bg-[color:var(--surface)] p-6">
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
              No approved access switch matches every hard requirement.
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
              Loosen one or more hard filters, or enable core / aggregation models if
              this request is really for transport, backbone, or aggregation duties.
            </p>
          </div>
        )}
      </section>

      {buckets.alternates.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Alternates
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-950">
              Alternate approved matches
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
              />
            ))}
          </div>
        </section>
      ) : null}

      {buckets.coreMatches.length > 0 ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-900/70">
              Separated section
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-950">
              Core / aggregation candidates
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
              These are visible only because core / aggregation models were explicitly
              enabled. They are not mixed into the normal access recommendation flow.
            </p>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            {buckets.coreMatches.map((result) => (
              <SwitchCard
                key={result.switch.model}
                model={result.switch}
                matchReasons={result.matchReasons}
                watchOuts={result.watchOuts}
                summary={result.summary}
                variant="core"
              />
            ))}
          </div>
        </section>
      ) : null}

      <DisqualifiedList items={buckets.disqualified} />
    </div>
  );
}
