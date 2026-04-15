"use client";

import Image from "next/image";
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:gap-5 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3 sm:items-start sm:gap-5">
            <div className="relative h-12 w-[4.5rem] shrink-0 sm:h-[5.25rem] sm:w-[7.75rem]">
              <Image
                src="/dtcav_white.png"
                alt="DTC AV"
                fill
                priority
                className="object-contain object-left"
                sizes="(min-width: 640px) 124px, 72px"
              />
            </div>
            <div className="max-w-3xl">
              <p className="hidden text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200/60 sm:block">
                Internal AV Engineering Tool
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-slate-50 sm:mt-2 sm:text-4xl">
                <span className="sm:hidden">Netgear AV Selector</span>
                <span className="hidden sm:inline">Netgear AV Line Switch Selector</span>
              </h1>
              <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-slate-300 sm:block sm:text-base">
                Clean, fast access-layer guidance for commercial AV-over-IP rooms and racks.
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-1.5 sm:gap-2">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:py-2 sm:text-sm ${
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
        <div className="hidden rounded-2xl border border-slate-800 bg-slate-900/75 px-4 py-3 text-sm leading-6 text-slate-300 sm:block">
          This selector only recommends models from our approved internal Netgear AV
          switch list. Final design still requires engineering review for multicast
          behavior, uplinks, power, and AV traffic segregation.
        </div>
      </div>
    </header>
  );
}
