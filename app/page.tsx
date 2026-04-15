import { Suspense } from "react";
import { SelectorApp } from "@/components/selector-app";

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <SelectorApp />
    </Suspense>
  );
}
