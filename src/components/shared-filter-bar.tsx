"use client";

import { useBranchFilter } from "@/lib/branch-filter-context";
import { DashboardFilterBar } from "@/components/dashboard-filters";
import { FeatureIcon } from "@/components/feature-icon";
import { InsightPeriod } from "@/lib/types";

export function SharedFilterBar({
  period,
  onPeriodChange,
  showPeriod = true,
}: {
  period?: InsightPeriod;
  onPeriodChange?: (p: InsightPeriod) => void;
  showPeriod?: boolean;
}) {
  const { branchFilter, setBranchFilter, branches } = useBranchFilter();

  if (!showPeriod || !period || !onPeriodChange) {
    return (
      <div className="menu-toolbar">
        <FeatureIcon name="store" className="h-4 w-4 shrink-0 text-[var(--forest)]" />
        <select
          className="menu-toolbar-select"
          value={branchFilter ?? ""}
          onChange={(e) => setBranchFilter(e.target.value === "" ? null : e.target.value)}
          aria-label="Pilih toko"
        >
          <option value="">Semua toko</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <DashboardFilterBar
      period={period}
      branchFilter={branchFilter}
      branches={branches}
      onPeriodChange={onPeriodChange}
      onBranchChange={setBranchFilter}
    />
  );
}
