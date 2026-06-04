"use client";

import { InsightPeriod, PERIOD_LABELS } from "@/lib/types";

const PERIODS: InsightPeriod[] = ["today", "week", "month", "year"];

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function PeriodFilter({
  period,
  onChange,
}: {
  period: InsightPeriod;
  onChange: (p: InsightPeriod) => void;
}) {
  return (
    <div className="control-track-period" role="tablist" aria-label="Periode">
      {PERIODS.map((p) => {
        const active = period === p;
        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(p)}
            className={active ? "control-pill control-pill-active" : "control-pill"}
          >
            <span className="control-pill-text">{PERIOD_LABELS[p]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function StoreFilter({
  value,
  branches,
  onChange,
}: {
  value: string | null;
  branches: { id: string; name: string }[];
  onChange: (branchId: string | null) => void;
}) {
  return (
    <div className="control-track-select">
      <StoreIcon className="control-select-icon" />
      <select
        className="control-select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        aria-label="Pilih toko"
      >
        <option value="">Semua toko</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      <ChevronIcon className="control-select-chevron" />
    </div>
  );
}

export function DashboardFilterBar({
  period,
  branchFilter,
  branches,
  onPeriodChange,
  onBranchChange,
}: {
  period: InsightPeriod;
  branchFilter: string | null;
  branches: { id: string; name: string }[];
  onPeriodChange: (p: InsightPeriod) => void;
  onBranchChange: (id: string | null) => void;
}) {
  return (
    <div className="card card-compact filter-bar mb-4">
      <div className="filter-bar-grid">
        <div className="filter-field">
          <p className="filter-field-label">Periode</p>
          <PeriodFilter period={period} onChange={onPeriodChange} />
        </div>
        <div className="filter-field">
          <p className="filter-field-label">Toko</p>
          <StoreFilter
            value={branchFilter}
            branches={branches}
            onChange={onBranchChange}
          />
        </div>
      </div>
    </div>
  );
}
