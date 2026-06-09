"use client";

import { useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SharedFilterBar } from "@/components/shared-filter-bar";
import { useAuth } from "@/lib/auth-context";
import { useBranchFilter } from "@/lib/branch-filter-context";
import { useDashboardData } from "@/lib/dashboard-data-context";
import { formatIdr } from "@/lib/format";
import { Order } from "@/lib/types";

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isToday(order: Order, now: Date): boolean {
  return order.createdAt >= startOfDay(now);
}

function statusLabel(status: Order["status"]): string {
  switch (status) {
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Batal";
    case "open":
      return "Open bill";
    case "processing":
      return "Diproses";
    case "ready":
      return "Siap";
    default:
      return "Baru";
  }
}

export function OrdersDashboard() {
  const { profile, signOut } = useAuth();
  const { branchFilter, branchName } = useBranchFilter();
  const { orders, loading, error, refresh } = useDashboardData();
  const now = useMemo(() => new Date(), [orders.length, loading]);

  const todayOrders = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            o.status !== "cancelled" &&
            isToday(o, now),
        )
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [orders, now],
  );

  const completedToday = todayOrders.filter((o) => o.status === "completed");
  const totalSales = completedToday.reduce((s, o) => s + o.total, 0);
  const cashSales = completedToday
    .filter((o) => o.paymentMethod === "cash")
    .reduce((s, o) => s + o.total, 0);
  const qrisSales = completedToday
    .filter((o) => o.paymentMethod === "qris")
    .reduce((s, o) => s + o.total, 0);

  const dateLabel = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--lime)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 md:max-w-5xl md:px-8">
      <DashboardHeader
        ownerName={profile?.fullName ?? "Owner"}
        period="today"
        dateLabel={dateLabel}
        onRefresh={refresh}
        onSignOut={() => signOut()}
        title="Transaksi"
        subtitle={
          branchFilter
            ? `Pesanan hari ini · ${branchName(branchFilter)}`
            : "Pesanan hari ini · semua toko"
        }
      />

      <SharedFilterBar showPeriod={false} />

      {error && (
        <div className="card mb-4 p-4 text-sm text-[var(--red)]">{error}</div>
      )}

      <div className="balance-card mb-4">
        <p className="text-xs text-white/70">Recap Hari Ini</p>
        <p className="text-2xl font-bold">{formatIdr(totalSales)}</p>
        <p className="mt-1 text-[11px] text-white/60">
          {completedToday.length} transaksi selesai · Tunai {formatIdr(cashSales)} · QRIS{" "}
          {formatIdr(qrisSales)}
        </p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-heading">Daftar Transaksi</h2>
        <span className="text-xs text-[var(--caption)]">{todayOrders.length} item</span>
      </div>

      {todayOrders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-[var(--caption)]">Belum ada transaksi hari ini</p>
        </div>
      ) : (
        <div className="space-y-2">
          {todayOrders.map((order) => (
            <div key={order.id} className="card card-compact p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{order.orderNumber}</p>
                  <p className="text-[11px] text-[var(--caption)]">
                    {order.createdAt.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {!branchFilter && order.branchId
                      ? ` · ${branchName(order.branchId)}`
                      : ""}
                  </p>
                  <p className="mt-1 text-sm font-bold">{formatIdr(order.total)}</p>
                  <p className="text-[10px] text-[var(--caption)]">
                    {order.lines.length} item
                    {order.paymentMethod
                      ? ` · ${order.paymentMethod === "cash" ? "Tunai" : "QRIS"}`
                      : ""}
                  </p>
                </div>
                <span className="chip shrink-0">{statusLabel(order.status)}</span>
              </div>
              {order.lines.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-[var(--border)] pt-3 text-[11px] text-[var(--caption)]">
                  {order.lines.slice(0, 4).map((line, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="truncate">
                        {line.quantity}x {line.name}
                      </span>
                      <span className="shrink-0 font-semibold text-[var(--ink)]">
                        {formatIdr(line.subtotal)}
                      </span>
                    </li>
                  ))}
                  {order.lines.length > 4 && (
                    <li>+{order.lines.length - 4} item lainnya</li>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
