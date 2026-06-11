"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DashboardGrid, PageSection } from "@/components/dashboard-layout";
import { FeatureIcon, FeatureIconName } from "@/components/feature-icon";
import { computeNetworkInsights } from "@/lib/analytics/branch-insights";
import { buildPeriodMetrics } from "@/lib/analytics/period-metrics";
import { useDashboardData } from "@/lib/dashboard-data-context";
import { useBranchFilter } from "@/lib/branch-filter-context";
import { formatIdr } from "@/lib/format";

function shortBranchName(name: string): string {
  const parts = name.split("—");
  if (parts.length > 1) return parts[parts.length - 1].trim();
  return name;
}

export function HomeDashboard() {
  const { orders, customerCount, loading, error } = useDashboardData();
  const { branches } = useBranchFilter();
  const now = useMemo(() => new Date(), [orders.length, loading]);

  const monthMetrics = useMemo(
    () => buildPeriodMetrics(orders, "month", customerCount, null, now),
    [orders, customerCount, now],
  );

  const monthInsight = useMemo(
    () => computeNetworkInsights("month", branches, orders, now),
    [branches, orders, now],
  );

  const topMenus = useMemo(() => {
    const products = monthMetrics.topProducts.filter((p) => p.quantitySold > 0).slice(0, 3);
    const totalQty = monthMetrics.topProducts.reduce((s, p) => s + p.quantitySold, 0);
    return products.map((p, i) => ({
      rank: i + 1,
      name: p.name,
      share: totalQty <= 0 ? 0 : Math.round((p.quantitySold / totalQty) * 100),
    }));
  }, [monthMetrics.topProducts]);

  const recentOrders = useMemo(() => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return orders
      .filter((o) => o.status === "completed" && o.createdAt >= start)
      .slice(0, 5);
  }, [orders, now]);

  const lead = monthInsight.branches[0];
  const trail = monthInsight.branches[1];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--lime)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <div className="card p-6 text-[var(--red)]">{error}</div>;
  }

  const cashTotal = monthMetrics.cashSales + monthMetrics.qrisSales;
  const cashPct = cashTotal > 0 ? Math.round((monthMetrics.cashSales / cashTotal) * 100) : 0;
  const qrisPct = cashTotal > 0 ? 100 - cashPct : 0;

  return (
    <div className="dashboard-page">
      <DashboardGrid cols={2}>
        <div className="balance-card xl:col-span-2">
          <div className="chip mb-4 w-fit bg-white/10 text-white">Semua Toko</div>
          <p className="text-sm text-white/70">Penjualan Keseluruhan</p>
          <p className="mt-2 text-3xl font-bold">{formatIdr(monthMetrics.totalSales)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={monthMetrics.salesTrendUp ? "trend-up" : "trend-down"}>
              {monthMetrics.salesTrendUp ? "+" : ""}
              {Math.round(monthMetrics.salesTrendPercent)}% vs bulan lalu
            </span>
            <span className="text-xs text-white/60">
              {monthMetrics.transactionCount} transaksi · {monthMetrics.periodCaption}
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/dashboard/transactions" className="btn-primary !text-[var(--ink)]">
              Laporan
            </Link>
            <Link href="/dashboard/analytics" className="btn-outline !border-white/20 !bg-white/10 !text-white">
              Analytics
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="section-heading">Top 3 menu terlaris</h3>
          <p className="section-subheading">Bulan berjalan · seluruh cabang</p>
          <div className="mt-4 space-y-3">
            {topMenus.length === 0 ? (
              <p className="text-sm text-[var(--caption)]">Belum ada data</p>
            ) : (
              topMenus.map((item) => (
                <div key={item.rank} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--lime-track)] text-xs font-bold text-[var(--forest)]">
                    {item.rank}
                  </span>
                  <span className="flex-1 truncate text-sm font-semibold">{item.name}</span>
                  <span className="text-sm font-bold">{item.share}%</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="section-heading">Pembayaran</h3>
          <p className="section-subheading">Tunai vs QRIS bulan ini</p>
          <div className="mt-4">
            <p className="text-3xl font-bold">{cashPct >= qrisPct ? `${cashPct}%` : `${qrisPct}%`}</p>
            <p className="text-sm text-[var(--caption)]">{cashPct >= qrisPct ? "Tunai" : "QRIS"} dominan</p>
            <div className="mt-4 flex gap-3 text-xs text-[var(--caption)]">
              <span>Tunai {cashPct}%</span>
              <span>QRIS {qrisPct}%</span>
            </div>
          </div>
        </div>

        <div className="card p-5 xl:col-span-2">
          <h3 className="section-heading">Perbandingan Cabang</h3>
          <p className="section-subheading">Kontribusi penjualan bulan berjalan</p>
          {!lead ? (
            <p className="mt-4 text-sm text-[var(--caption)]">Belum ada data cabang</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[lead, trail].filter(Boolean).map((branch) => (
                <div key={branch!.branchId} className="rounded-2xl bg-[var(--bg)] p-4">
                  <p className="font-semibold">{shortBranchName(branch!.branchName)}</p>
                  <p className="mt-1 text-lg font-bold">{formatIdr(branch!.totalSales)}</p>
                  <p className="text-xs text-[var(--caption)]">
                    {Math.round(branch!.sharePercent)}% · {branch!.transactionCount} transaksi
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardGrid>

      <PageSection title="Akses Cepat" subtitle="Fitur operasional owner">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/dashboard/menu", label: "Menu", desc: "Kelola produk per toko", icon: "menu" as FeatureIconName },
            { href: "/dashboard/transactions", label: "Transaksi", desc: "Riwayat penjualan", icon: "wallet" as FeatureIconName },
            { href: "/dashboard/customers", label: "Pelanggan", desc: "Daftar member", icon: "customers" as FeatureIconName },
            { href: "/dashboard/loyalty", label: "Loyalty", desc: "Program poin", icon: "loyalty" as FeatureIconName },
            { href: "/dashboard/inventory", label: "Inventory", desc: "Stok bahan baku", icon: "inventory" as FeatureIconName },
            { href: "/dashboard/settings/admins", label: "Admin & Toko", desc: "Kelola tim & cabang", icon: "store" as FeatureIconName },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="menu-tile">
              <div className="menu-tile-icon">
                <FeatureIcon name={item.icon} />
              </div>
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs text-[var(--caption)]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </PageSection>

      <PageSection
        title="Transaksi Hari Ini"
        subtitle="5 transaksi terakhir"
        action={
          <Link href="/dashboard/transactions" className="text-sm font-semibold text-[var(--forest)]">
            Lihat semua
          </Link>
        }
      >
        <div className="card card-flat overflow-hidden">
          {recentOrders.length === 0 ? (
            <p className="p-6 text-sm text-[var(--caption)]">Belum ada transaksi hari ini</p>
          ) : (
            recentOrders.map((order, i) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className={`flex items-center justify-between px-4 py-3 transition hover:bg-[var(--bg)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}
              >
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-[var(--caption)]">
                    {order.createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className="font-bold">{formatIdr(order.total)}</p>
              </Link>
            ))
          )}
        </div>
      </PageSection>
    </div>
  );
}
