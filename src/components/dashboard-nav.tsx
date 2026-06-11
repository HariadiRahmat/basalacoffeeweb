"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Analytics", match: (p: string) => p === "/dashboard" },
  { href: "/dashboard/menu", label: "Menu", match: (p: string) => p.startsWith("/dashboard/menu") },
  {
    href: "/dashboard/orders",
    label: "Transaksi",
    match: (p: string) => p.startsWith("/dashboard/orders"),
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    match: (p: string) => p.startsWith("/dashboard/inventory"),
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-sm"
      aria-label="Navigasi dashboard"
    >
      <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-2 md:px-8">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "rounded-full bg-[var(--forest-dark)] px-4 py-2 text-xs font-bold text-white"
                  : "rounded-full px-4 py-2 text-xs font-semibold text-[var(--caption)] transition hover:bg-[var(--surface)] hover:text-[var(--ink)]"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
