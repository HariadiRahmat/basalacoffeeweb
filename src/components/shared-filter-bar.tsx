"use client";

import { useBranchFilter } from "@/lib/branch-filter-context";
import { DashboardFilterBar } from "@/components/dashboard-filters";
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
      <div className="card card-compact filter-bar mb-4">
        <div className="filter-field">
          <p className="filter-field-label">Toko</p>
          <select
            className="control-select w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"
            value={branchFilter ?? ""}
            onChange={(e) =>
              setBranchFilter(e.target.value === "" ? null : e.target.value)
            }
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
