import {
  matchesBranchScope,
  orderInPeriod,
  referenceNowForPrevious,
  startOfDay,
} from "@/lib/analytics/branch-insights";
import {
  InsightPeriod,
  Order,
  SalesDataPoint,
  TopProduct,
} from "@/lib/types";

export interface PeriodMetrics {
  period: InsightPeriod;
  branchId: string | null;
  customerCount: number;
  transactionCount: number;
  previousTransactionCount: number;
  transactionTrendPercent: number;
  transactionTrendUp: boolean;
  totalSales: number;
  previousTotalSales: number;
  salesTrendPercent: number;
  salesTrendUp: boolean;
  cashSales: number;
  qrisSales: number;
  cashTransactions: number;
  qrisTransactions: number;
  averageOrderValue: number;
  totalProductsSold: number;
  topProducts: TopProduct[];
  salesChart: SalesDataPoint[];
  periodCaption: string;
  trendComparisonLabel: string;
  revenueKpiLabel: string;
}

export function buildPeriodMetrics(
  orders: Order[],
  period: InsightPeriod,
  customerCount: number,
  branchId: string | null,
  now = new Date(),
): PeriodMetrics {
  const matchesBranch = (order: Order) => {
    if (!branchId) return true;
    return matchesBranchScope(order.branchId, branchId);
  };

  const completedInPeriod = orders.filter(
    (o) =>
      o.status === "completed" &&
      orderInPeriod(o, period, now) &&
      matchesBranch(o),
  );

  const prevRef = referenceNowForPrevious(period, now);
  const completedPrevious = orders.filter(
    (o) =>
      o.status === "completed" &&
      orderInPeriod(o, period, prevRef) &&
      matchesBranch(o),
  );

  const transactionCount = completedInPeriod.length;
  const previousTransactionCount = completedPrevious.length;
  const transactionTrendPercent =
    previousTransactionCount <= 0
      ? transactionCount > 0
        ? 100
        : 0
      : ((transactionCount - previousTransactionCount) /
          previousTransactionCount) *
        100;

  const totalSales = completedInPeriod.reduce((s, o) => s + o.total, 0);
  const previousTotalSales = completedPrevious.reduce((s, o) => s + o.total, 0);
  const salesTrendPercent =
    previousTotalSales <= 0
      ? totalSales > 0
        ? 100
        : 0
      : ((totalSales - previousTotalSales) / previousTotalSales) * 100;

  const cashSales = completedInPeriod
    .filter((o) => o.paymentMethod === "cash")
    .reduce((s, o) => s + o.total, 0);
  const qrisSales = completedInPeriod
    .filter((o) => o.paymentMethod === "qris")
    .reduce((s, o) => s + o.total, 0);

  const productStats = new Map<
    string,
    { name: string; qty: number; revenue: number }
  >();
  for (const order of completedInPeriod) {
    for (const line of order.lines) {
      const cur = productStats.get(line.menuItemId);
      productStats.set(line.menuItemId, {
        name: line.name,
        qty: (cur?.qty ?? 0) + line.quantity,
        revenue: (cur?.revenue ?? 0) + line.subtotal,
      });
    }
  }

  const topProducts = [...productStats.entries()]
    .map(([menuItemId, v]) => ({
      menuItemId,
      name: v.name,
      quantitySold: v.qty,
      revenue: v.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const trendComparisonLabel =
    period === "today"
      ? "vs kemarin"
      : period === "week"
        ? "vs minggu lalu"
        : period === "month"
          ? "vs bulan lalu"
          : "vs tahun lalu";

  const revenueKpiLabel =
    period === "today"
      ? "Penjualan hari ini"
      : period === "week"
        ? "Penjualan minggu"
        : period === "month"
          ? "Penjualan bulan"
          : "Penjualan tahun";

  return {
    period,
    branchId,
    customerCount,
    transactionCount,
    previousTransactionCount,
    transactionTrendPercent,
    transactionTrendUp: transactionTrendPercent >= 0,
    totalSales,
    previousTotalSales,
    salesTrendPercent,
    salesTrendUp: salesTrendPercent >= 0,
    cashSales,
    qrisSales,
    cashTransactions: completedInPeriod.filter(
      (o) => o.paymentMethod === "cash",
    ).length,
    qrisTransactions: completedInPeriod.filter(
      (o) => o.paymentMethod === "qris",
    ).length,
    averageOrderValue:
      transactionCount > 0 ? totalSales / transactionCount : 0,
    totalProductsSold: completedInPeriod.reduce(
      (s, o) => s + o.lines.reduce((ls, l) => ls + l.quantity, 0),
      0,
    ),
    topProducts,
    salesChart: buildSalesChart(completedInPeriod, period, totalSales, now),
    periodCaption: buildPeriodCaption(period, now),
    trendComparisonLabel,
    revenueKpiLabel,
  };
}

function buildPeriodCaption(period: InsightPeriod, now: Date): string {
  switch (period) {
    case "today":
      return "Hari ini";
    case "week":
      return "7 hari terakhir";
    case "month":
      return `${now.getMonth() + 1}/${now.getFullYear()}`;
    case "year":
      return `${now.getFullYear()}`;
  }
}

function buildSalesChart(
  orders: Order[],
  period: InsightPeriod,
  totalSales: number,
  now: Date,
): SalesDataPoint[] {
  switch (period) {
    case "today":
      return [{ label: "Hari ini", amount: totalSales }];
    case "week": {
      const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      const todayStart = startOfDay(now);
      return Array.from({ length: 7 }, (_, index) => {
        const day = new Date(todayStart);
        day.setDate(day.getDate() - (6 - index));
        const next = new Date(day);
        next.setDate(next.getDate() + 1);
        const amount = orders
          .filter((o) => o.createdAt >= day && o.createdAt < next)
          .reduce((s, o) => s + o.total, 0);
        return { label: labels[day.getDay() === 0 ? 6 : day.getDay() - 1], amount };
      });
    }
    case "month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      const weekCount = Math.floor((daysInMonth - 1) / 7) + 1;
      return Array.from({ length: weekCount }, (_, weekIndex) => {
        const weekStart = new Date(monthStart);
        weekStart.setDate(weekStart.getDate() + weekIndex * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const amount = orders
          .filter((o) => o.createdAt >= weekStart && o.createdAt < weekEnd)
          .reduce((s, o) => s + o.total, 0);
        return { label: `W${weekIndex + 1}`, amount };
      });
    }
    case "year": {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Agu",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      return months.map((label, monthIndex) => {
        const monthStart = new Date(now.getFullYear(), monthIndex, 1);
        const monthEnd = new Date(now.getFullYear(), monthIndex + 1, 1);
        const amount = orders
          .filter((o) => o.createdAt >= monthStart && o.createdAt < monthEnd)
          .reduce((s, o) => s + o.total, 0);
        return { label, amount };
      });
    }
  }
}

export function salesChartTitle(period: InsightPeriod): string {
  switch (period) {
    case "today":
      return "Penjualan Hari Ini";
    case "week":
      return "Penjualan 7 Hari Terakhir";
    case "month":
      return "Penjualan per Minggu";
    case "year":
      return "Penjualan per Bulan";
  }
}
