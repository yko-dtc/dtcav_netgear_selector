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
    <header className="border-b border-[color:var(--border)] bg-[color:var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-900/75">
              Internal AV Engineering Tool
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-slate-950">
              Netgear AV Line Switch Selector
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-700 sm:text-base">
              Fast access-layer guidance for Crestron NVX, Q-SYS Q-LAN, Dante,
              and similar multicast AV-over-IP deployments.
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
                      ? "border-teal-800 bg-teal-900 text-white"
                      : "border-slate-900/10 bg-white/70 text-slate-700 hover:border-teal-700/40 hover:text-teal-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="rounded-2xl border border-amber-700/20 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          This selector only recommends models from our approved internal Netgear AV
          switch list. Final design still requires engineering review for multicast
          behavior, uplinks, power, and AV traffic segregation.
        </div>
      </div>
    </header>
  );
}

