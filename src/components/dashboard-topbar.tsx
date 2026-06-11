"use client";

import { FeatureIcon } from "@/components/feature-icon";
import { useAuth } from "@/lib/auth-context";
import { useBranchFilter } from "@/lib/branch-filter-context";
import { usePathname } from "next/navigation";
import { MAIN_NAV } from "@/lib/navigation";

function pageMeta(pathname: string): { title?: string; subtitle?: string } {
  if (pathname === "/dashboard") {
    return { title: "Dashboard", subtitle: "Ringkasan bisnis Coffee Basala" };
  }
  for (const item of MAIN_NAV) {
    if (item.match(pathname)) {
      if (item.children) {
        const child = item.children.find((c) => c.match(pathname));
        if (child && child.href !== item.href) {
          return { title: child.label, subtitle: item.label };
        }
      }
      return { title: item.label, subtitle: "Coffee Basala Owner" };
    }
  }
  if (pathname.startsWith("/dashboard/orders/")) {
    return { title: "Detail Transaksi", subtitle: "Informasi pesanan" };
  }
  if (pathname.startsWith("/dashboard/reports")) {
    return { title: "Laporan Keuangan", subtitle: "Export data & laporan sistem" };
  }
  return { title: "Dashboard", subtitle: "Coffee Basala Owner" };
}

export function DashboardTopbar({
  title: titleProp,
  subtitle: subtitleProp,
}: {
  title?: string;
  subtitle?: string;
}) {
  const { profile, signOut } = useAuth();
  const { branchFilter, setBranchFilter, branches } = useBranchFilter();
  const pathname = usePathname();
  const meta = pageMeta(pathname);
  const ownerName = profile?.fullName ?? "Owner";
  const title = titleProp ?? meta.title;
  const subtitle = subtitleProp ?? meta.subtitle;

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar-left">
        <p className="dashboard-topbar-greeting">
          Hello, <strong>{ownerName.split(" ")[0]}</strong>
        </p>
        {title && (
          <div className="dashboard-topbar-title-row">
            <h1 className="dashboard-topbar-title">{title}</h1>
            {subtitle && <span className="dashboard-topbar-subtitle">{subtitle}</span>}
          </div>
        )}
      </div>

      <div className="dashboard-topbar-actions">
        <label className="dashboard-topbar-select-wrap">
          <FeatureIcon name="store" className="dashboard-topbar-select-icon" />
          <span className="sr-only">Filter toko</span>
          <select
            className="dashboard-topbar-select"
            value={branchFilter ?? ""}
            onChange={(e) => setBranchFilter(e.target.value || null)}
          >
            <option value="">Semua toko</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => signOut()} className="dashboard-topbar-logout">
          Keluar
        </button>
      </div>
    </header>
  );
}
