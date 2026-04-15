import type { RecommendationResult } from "@/lib/types";

interface DisqualifiedListProps {
  items: RecommendationResult[];
}

export function DisqualifiedList({ items }: DisqualifiedListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <details className="rounded-[32px] border border-slate-800 bg-slate-950/65 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.4)] backdrop-blur-xl">
      <summary className="cursor-pointer list-none text-lg font-semibold text-slate-50">
        Excluded models ({items.length})
      </summary>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Expanded for transparency when you need to explain why a model was held back.
      </p>
      <div className="mt-4 grid gap-4">
        {items.map((item) => (
          <div
            key={item.switch.model}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4"
          >
            <p className="font-semibold text-slate-100">{item.switch.model}</p>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
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
