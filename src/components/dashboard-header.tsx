"use client";

import { InsightPeriod, PERIOD_LABELS } from "@/lib/types";

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export function DashboardHeader({
  ownerName,
  period,
  dateLabel,
  onRefresh,
  onSignOut,
  title = "Dashboard",
  subtitle,
}: {
  ownerName: string;
  period: InsightPeriod;
  dateLabel: string;
  onRefresh: () => void;
  onSignOut: () => void;
  title?: string;
  subtitle?: string;
}) {
  return (
    <header className="dashboard-header">
      <div className="dashboard-header-main">
        <p className="dashboard-welcome">
          Welcome back, <span className="dashboard-welcome-name">{ownerName}</span>
        </p>
        <div className="dashboard-title-row">
          <h1 className="dashboard-title">{title}</h1>
          <span className="dashboard-meta">
            {PERIOD_LABELS[period]} · {dateLabel}
          </span>
        </div>
        <p className="dashboard-brand">
          {subtitle ?? "Coffee Basala · Owner"}
        </p>
      </div>
      <div className="dashboard-header-actions">
        <button type="button" onClick={onRefresh} className="btn-toolbar">
          <RefreshIcon />
          <span>Refresh</span>
        </button>
        <button type="button" onClick={onSignOut} className="btn-toolbar btn-toolbar-muted">
          Keluar
        </button>
      </div>
    </header>
  );
}
