"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageSection } from "@/components/dashboard-layout";
import { SharedFilterBar } from "@/components/shared-filter-bar";
import { orderInPeriod } from "@/lib/analytics/branch-insights";
import { useBranchFilter } from "@/lib/branch-filter-context";
import { useDashboardData } from "@/lib/dashboard-data-context";
import { formatIdr } from "@/lib/format";
import { InsightPeriod, ORDER_STATUS_LABELS, Order } from "@/lib/types";

export function TransactionsDashboard() {
  const { branchFilter, branchName } = useBranchFilter();
  const { orders, loading, error } = useDashboardData();
  const [period, setPeriod] = useState<InsightPeriod>("today");
  const now = useMemo(() => new Date(), [orders.length, loading, period]);

  const periodOrders = useMemo(() => {
    return orders
      .filter(
        (o) =>
          o.status !== "cancelled" &&
          !["open"].includes(o.status) &&
          orderInPeriod(o, period, now),
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [orders, period, now]);

  const completed = periodOrders.filter((o) => o.status === "completed");
  const totalSales = completed.reduce((s, o) => s + o.total, 0);
  const cashSales = completed.filter((o) => o.paymentMethod === "cash").reduce((s, o) => s + o.total, 0);
  const qrisSales = completed.filter((o) => o.paymentMethod === "qris").reduce((s, o) => s + o.total, 0);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--lime)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <SharedFilterBar period={period} onPeriodChange={setPeriod} />

      {error && <div className="card text-sm text-[var(--red)]">{error}</div>}

      <div className="balance-card">
        <p className="text-xs text-white/70">Recap Periode</p>
        <p className="text-2xl font-bold">{formatIdr(totalSales)}</p>
        <p className="mt-1 text-[11px] text-white/60">
          {completed.length} transaksi selesai · Tunai {formatIdr(cashSales)} · QRIS {formatIdr(qrisSales)}
          {branchFilter ? ` · ${branchName(branchFilter)}` : " · Semua toko"}
        </p>
      </div>

      <PageSection title="Daftar Transaksi" subtitle={`${periodOrders.length} item`}>
        {periodOrders.length === 0 ? (
          <div className="menu-list">
            <p className="menu-empty">Belum ada transaksi pada periode ini</p>
          </div>
        ) : (
          <div className="menu-list">
            {periodOrders.map((order) => (
              <OrderRow key={order.id} order={order} showBranch={!branchFilter} branchName={branchName} />
            ))}
          </div>
        )}
      </PageSection>
    </div>
  );
}

function OrderRow({
  order,
  showBranch,
  branchName,
}: {
  order: Order;
  showBranch: boolean;
  branchName: (id: string) => string;
}) {
  return (
    <Link href={`/dashboard/orders/${order.id}`} className="menu-row transition hover:bg-[var(--bg)]/60">
      <div className="menu-row-main">
        <p className="menu-row-name">{order.orderNumber}</p>
        <p className="menu-row-meta">
          {order.createdAt.toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
          {showBranch && order.branchId ? ` · ${branchName(order.branchId)}` : ""}
        </p>
      </div>
      <p className="shrink-0 text-sm font-bold tabular-nums">{formatIdr(order.total)}</p>
      <span className="chip shrink-0">{ORDER_STATUS_LABELS[order.status]}</span>
    </Link>
  );
}
