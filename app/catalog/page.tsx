import { SwitchCard } from "@/components/switch-card";
import { switches } from "@/data/switches";
import { buildCatalogNotes } from "@/lib/explain";
import { getCatalogGroups } from "@/lib/ranking";

export default function CatalogPage() {
  const groups = getCatalogGroups(switches);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-slate-800 bg-slate-950/70 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/60">
          Approved list
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-50">
          Internal approved Netgear catalog
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Catalog view groups approved switches by role so access-layer options stay
          distinct from core / aggregation gear during AV system design.
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/60">
            Access switches
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-50">
            Room and rack access models
          </h3>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {groups.access.map((switchModel) => (
            <SwitchCard
              key={switchModel.model}
              model={switchModel}
              matchReasons={[buildCatalogNotes(switchModel)]}
              watchOuts={switchModel.notes}
              variant="catalog"
              insightLabel="At a glance"
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/60">
            Core / aggregation switches
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-50">
            Backbone and transport models
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            These models are intentionally separated so nobody mistakes a core switch
            for a normal room-rack endpoint switch.
          </p>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {groups.core.map((switchModel) => (
            <SwitchCard
              key={switchModel.model}
              model={switchModel}
              matchReasons={[buildCatalogNotes(switchModel)]}
              watchOuts={switchModel.notes}
              variant="core"
              insightLabel="At a glance"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
