"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Selector" },
  { href: "/catalog", label: "Catalog" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200/60">
              Internal AV Engineering Tool
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
              Netgear AV Line Switch Selector
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Clean, fast access-layer guidance for commercial AV-over-IP rooms and racks.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-sky-300/30 bg-sky-200/10 text-sky-50"
                      : "border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/75 px-4 py-3 text-sm leading-6 text-slate-300">
          This selector only recommends models from our approved internal Netgear AV
          switch list. Final design still requires engineering review for multicast
          behavior, uplinks, power, and AV traffic segregation.
        </div>
      </div>
    </header>
  );
}
