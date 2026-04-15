import type { RecommendationResult } from "@/lib/types";

interface DisqualifiedListProps {
  items: RecommendationResult[];
}

export function DisqualifiedList({ items }: DisqualifiedListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <details className="rounded-[28px] border border-slate-900/10 bg-[color:var(--surface)] p-5">
      <summary className="cursor-pointer list-none text-lg font-semibold text-slate-950">
        Excluded models ({items.length})
      </summary>
      <p className="mt-2 text-sm text-slate-600">
        Expanded for transparency when you need to explain why a model was held back.
      </p>
      <div className="mt-4 grid gap-4">
        {items.map((item) => (
          <div
            key={item.switch.model}
            className="rounded-2xl border border-slate-900/8 bg-white/80 p-4"
          >
            <p className="font-semibold text-slate-900">{item.switch.model}</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {item.disqualifiedReasons.map((reason) => (
                <li key={reason}>- {reason}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
