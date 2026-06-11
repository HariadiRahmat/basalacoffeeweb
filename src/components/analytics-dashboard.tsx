"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildMultiStoreChartData } from "@/lib/analytics/line-chart-data";
import {
  computeNetworkInsights,
  periodCaption,
  recapLabel,
} from "@/lib/analytics/branch-insights";
import {
  buildPeriodMetrics,
  salesChartTitle,
} from "@/lib/analytics/period-metrics";
import { useBranchFilter } from "@/lib/branch-filter-context";
import { useDashboardData } from "@/lib/dashboard-data-context";
import { chartAxisLabel, compactIdr, formatIdr } from "@/lib/format";
import { ChartFrame } from "@/components/chart-frame";
import { SharedFilterBar } from "@/components/shared-filter-bar";
import { BranchRecap, InsightPeriod } from "@/lib/types";

const PIE_COLORS = ["#C1E256", "#2D4636", "#A8CA3F", "#DCE5E1", "#8A9691"];

function shortBranchName(name: string): string {
  const parts = name.split("—");
  if (parts.length > 1) return parts[parts.length - 1].trim();
  return name.length > 18 ? `${name.slice(0, 17)}…` : name;
}

function TrendBadge({
  percent,
  up,
  suffix,
}: {
  percent: number;
  up: boolean;
  suffix: string;
}) {
  return (
    <span className={up ? "trend-up" : "trend-down"}>
      {up ? "+" : ""}
      {Math.round(percent)}% {suffix}
    </span>
  );
}

export function AnalyticsDashboard() {
  const { branchFilter, branches, branchName } = useBranchFilter();
  const { orders, customerCount, loading, error, refresh } = useDashboardData();
  const [period, setPeriod] = useState<InsightPeriod>("today");

  const now = useMemo(() => new Date(), [loading, period, branchFilter, orders.length]);
  const insight = useMemo(
    () => computeNetworkInsights(period, branches, orders, now),
    [period, branches, orders, now],
  );

  const filteredBranches = useMemo(() => {
    if (!branchFilter) return insight.branches;
    return insight.branches.filter((b) => b.branchId === branchFilter);
  }, [insight.branches, branchFilter]);

  const metrics = useMemo(
    () =>
      buildPeriodMetrics(orders, period, customerCount, branchFilter, now),
    [orders, period, customerCount, branchFilter, now],
  );

  const multiChart = useMemo(() => {
    if (branchFilter) return null;
    return buildMultiStoreChartData(period, insight.branches, orders, now);
  }, [branchFilter, period, insight.branches, orders, now]);

  const branchLabel =
    branchFilter === null ? "Semua toko" : branchName(branchFilter);

  const topProducts = metrics.topProducts.filter((p) => p.revenue > 0).slice(0, 5);
  const pieTotal = topProducts.reduce((s, p) => s + p.revenue, 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--lime)] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="card card-empty text-sm text-[var(--red)]">
          <p>{error}</p>
          <button type="button" onClick={refresh} className="btn-primary mt-4">
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  const filteredTotal = filteredBranches.reduce((s, b) => s + b.totalSales, 0);
  const filteredTx = filteredBranches.reduce(
    (s, b) => s + b.transactionCount,
    0,
  );

  const dateLabel = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="dashboard-page">
      <section className="dashboard-page">
        <div>
          <h2 className="section-heading">Performa Toko</h2>
          <p className="section-subheading">
            {branchFilter === null
              ? "Grafik penjualan semua cabang"
              : "Penjualan per cabang"} · {dateLabel}
          </p>
        </div>

        <SharedFilterBar period={period} onPeriodChange={setPeriod} />

        <div className="balance-card">
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--lime)]">
            {branchFilter === null
              ? `Semua toko · ${recapLabel(period)}`
              : recapLabel(period)}
          </span>
          <p className="mt-3 text-xs text-white/70">
            {branchFilter === null ? "Total Jaringan" : `Total ${branchLabel}`}
          </p>
          <p className="text-2xl font-bold">{formatIdr(filteredTotal)}</p>
          <p className="mt-1 text-[11px] text-white/60">
            {filteredTx} transaksi ·{" "}
            {branchFilter === null
              ? `${filteredBranches.length} toko`
              : "1 toko"}{" "}
            · {periodCaption(period, now)}
          </p>
        </div>

        <div className="kpi-row">
          <KpiTile label="Pelanggan" value={`${customerCount}`} />
          <KpiTile label="Cup terjual" value={`${metrics.totalProductsSold}`} />
          <KpiTile label="Rata-rata order" value={compactIdr(metrics.averageOrderValue)} />
        </div>

        {branchFilter === null && multiChart ? (
          <div className="card">
            <h3 className="text-sm font-bold">Perbandingan Penjualan</h3>
            <p className="text-[11px] text-[var(--caption)]">
              Semua toko · {periodCaption(period, now)}
            </p>
            <ChartFrame height={220} className="mt-4">
              <LineChart
                  data={multiChart.labels.map((label, i) => {
                    const row: Record<string, string | number> = { label };
                    for (const s of multiChart.series) {
                      row[s.branchId] = s.values[i] ?? 0;
                    }
                    return row;
                  })}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "var(--caption)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={chartAxisLabel}
                    tick={{ fontSize: 10, fill: "var(--caption)" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    formatter={(value) => formatIdr(Number(value ?? 0))}
                    labelFormatter={(l) => String(l)}
                  />
                  {multiChart.series.map((s) => (
                    <Line
                      key={s.branchId}
                      type="monotone"
                      dataKey={s.branchId}
                      name={shortBranchName(s.branchName)}
                      stroke={s.color}
                      strokeWidth={2.5}
                      dot={{
                        r: 4,
                        fill: "#fff",
                        stroke: s.color,
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
              </LineChart>
            </ChartFrame>
            <div className="mt-3 flex flex-wrap gap-3">
              {multiChart.series.map((s) => (
                <span key={s.branchId} className="flex items-center gap-1.5 text-[10px]">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full border-2 bg-white"
                    style={{ borderColor: s.color }}
                  />
                  {shortBranchName(s.branchName)}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredBranches.map((recap) => (
              <BranchCard key={recap.branchId} recap={recap} period={period} now={now} />
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-page">
        <h2 className="section-heading">Data detail</h2>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="card flex min-h-[168px] flex-col">
          <p className="text-[13px] font-bold">Transaksi</p>
          <p className="text-[10px] text-[var(--caption)]">{metrics.periodCaption}</p>
          <p className="mt-auto text-3xl font-bold">{metrics.transactionCount}</p>
          <div className="mt-2">
            <TrendBadge
              percent={metrics.transactionTrendPercent}
              up={metrics.transactionTrendUp}
              suffix={metrics.trendComparisonLabel}
            />
          </div>
        </div>
        <div className="card flex min-h-[168px] flex-col">
          <p className="text-[13px] font-bold">Penjualan</p>
          <p className="text-[10px] text-[var(--caption)]">{metrics.periodCaption}</p>
          <p className="mt-auto text-2xl font-bold">{formatIdr(metrics.totalSales)}</p>
          <div className="mt-2">
            <TrendBadge
              percent={metrics.salesTrendPercent}
              up={metrics.salesTrendUp}
              suffix={metrics.trendComparisonLabel}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-bold">{salesChartTitle(period)}</h3>
        <p className="text-xl font-bold">{formatIdr(metrics.totalSales)}</p>
        <ChartFrame height={200} className="mt-3">
          <BarChart data={metrics.salesChart} margin={{ left: 0, right: 4, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={chartAxisLabel} tick={{ fontSize: 10 }} width={36} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatIdr(Number(v ?? 0))} />
              <Bar dataKey="amount" fill="var(--lime)" radius={[6, 6, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ChartFrame>
      </div>

      <div className="card">
        <h3 className="text-sm font-bold">Pembayaran</h3>
        <div className="mt-3 space-y-2 text-[11px]">
          <PaymentRow
            label={`Tunai · ${metrics.cashTransactions} trx`}
            amount={metrics.cashSales}
            percent={
              metrics.cashSales + metrics.qrisSales > 0
                ? metrics.cashSales / (metrics.cashSales + metrics.qrisSales)
                : 0
            }
          />
          <PaymentRow
            label={`QRIS · ${metrics.qrisTransactions} trx`}
            amount={metrics.qrisSales}
            percent={
              metrics.cashSales + metrics.qrisSales > 0
                ? metrics.qrisSales / (metrics.cashSales + metrics.qrisSales)
                : 0
            }
            muted
          />
        </div>
      </div>

      <div className="card">
        <h3 className="text-sm font-bold">Menu Terlaris</h3>
        <p className="text-[11px] text-[var(--caption)]">{metrics.periodCaption}</p>
        {topProducts.length === 0 ? (
          <p className="mt-6 text-center text-xs text-[var(--caption)]">Belum ada data</p>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6 md:gap-10">
            <div className="relative mx-auto h-[200px] w-[200px] shrink-0">
              <ChartFrame height={200} className="absolute inset-0">
                <PieChart>
                  <Pie
                    data={topProducts}
                    dataKey="revenue"
                    nameKey="name"
                    innerRadius="52%"
                    outerRadius="88%"
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                  >
                    {topProducts.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartFrame>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <span className="text-[11px] font-semibold text-[var(--caption)] md:text-xs">
                  Total
                </span>
                <span className="text-sm font-bold text-[var(--ink)] md:text-base">
                  {compactIdr(pieTotal)}
                </span>
              </div>
            </div>
            <div className="w-full min-w-0 flex-1 space-y-2.5 sm:max-w-none md:py-2">
              {topProducts.map((p, i) => (
                <div
                  key={p.menuItemId}
                  className="flex items-center gap-2.5 text-[11px] md:text-sm"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full md:h-3 md:w-3"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                  <span className="shrink-0 tabular-nums font-bold">
                    {pieTotal > 0 ? Math.round((p.revenue / pieTotal) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </section>
    </div>
  );
}

function BranchCard({
  recap,
  period,
  now,
}: {
  recap: BranchRecap;
  period: InsightPeriod;
  now: Date;
}) {
  const growth = recap.growthPercent;
  return (
    <div className="card card-compact p-4">
      <div className="flex gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--lime-track)] text-[13px] font-bold text-[var(--forest)]">
          #{recap.rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold leading-tight">{recap.branchName}</p>
              <p className="text-[11px] text-[var(--caption)]">
                {recap.sharePercent.toFixed(1)}% dari total jaringan
              </p>
            </div>
            {growth != null && (
              <span className={growth >= 0 ? "trend-up" : "trend-down"}>
                {growth >= 0 ? "+" : ""}
                {growth.toFixed(1)}%
              </span>
            )}
          </div>
          <p className="mt-3 text-[11px] text-[var(--caption)]">Total Penjualan</p>
          <p className="text-xl font-bold">{formatIdr(recap.totalSales)}</p>
          <p className="text-[11px] text-[var(--caption)]">
            {recap.transactionCount} transaksi · {periodCaption(period, now)}
          </p>
          {recap.transactionCount > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-[var(--lime-track)] px-2.5 py-2">
                <p className="text-[10px] text-[var(--caption)]">Tunai</p>
                <p className="text-xs font-bold">{formatIdr(recap.cashSales)}</p>
              </div>
              <div className="rounded-xl bg-[var(--lime-track)] px-2.5 py-2">
                <p className="text-[10px] text-[var(--caption)]">QRIS</p>
                <p className="text-xs font-bold">{formatIdr(recap.qrisSales)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentRow({
  label,
  amount,
  percent,
  muted,
}: {
  label: string;
  amount: number;
  percent: number;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: muted ? "color-mix(in srgb, var(--lime) 40%, transparent)" : "var(--lime)",
        }}
      />
      <span className="flex-1 truncate font-semibold">{label}</span>
      <span className="font-bold">{compactIdr(amount)}</span>
      <span className="w-8 text-right text-[var(--caption)]">
        {Math.round(percent * 100)}%
      </span>
    </div>
  );
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="card card-compact px-2.5 py-2.5">
      <p className="text-[9px] text-[var(--caption)]">{label}</p>
      <p className="text-[15px] font-bold">{value}</p>
    </div>
  );
}
