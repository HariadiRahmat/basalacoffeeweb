import {
  Branch,
  BranchRecap,
  InsightPeriod,
  NetworkInsight,
  Order,
} from "@/lib/types";
import { LEGACY_DEFAULT_BRANCH_ID } from "@/lib/branch-scope";

export { matchesBranchScope } from "@/lib/branch-scope";

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function orderInPeriod(
  order: Order,
  period: InsightPeriod,
  now: Date,
): boolean {
  if (order.status !== "completed") return false;
  const created = order.createdAt;
  switch (period) {
    case "today":
      return created >= startOfDay(now);
    case "week": {
      const weekStart = startOfDay(now);
      weekStart.setDate(weekStart.getDate() - 6);
      return created >= weekStart;
    }
    case "month":
      return (
        created.getFullYear() === now.getFullYear() &&
        created.getMonth() === now.getMonth()
      );
    case "year":
      return created.getFullYear() === now.getFullYear();
  }
}

export function referenceNowForPrevious(period: InsightPeriod, now: Date): Date {
  switch (period) {
    case "today":
      return new Date(now.getTime() - 86400000);
    case "week":
      return new Date(now.getTime() - 7 * 86400000);
    case "month":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "year":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}

export function computeNetworkInsights(
  period: InsightPeriod,
  branches: Branch[],
  orders: Order[],
  now = new Date(),
): NetworkInsight {
  const previousRef = referenceNowForPrevious(period, now);
  const branchSales: Record<string, number> = {};
  const branchTx: Record<string, number> = {};
  const branchCash: Record<string, number> = {};
  const branchQris: Record<string, number> = {};
  const prevBranchSales: Record<string, number> = {};

  for (const branch of branches) {
    branchSales[branch.id] = 0;
    branchTx[branch.id] = 0;
    branchCash[branch.id] = 0;
    branchQris[branch.id] = 0;
    prevBranchSales[branch.id] = 0;
  }

  let unassignedSales = 0;
  let unassignedTx = 0;

  const resolveOrderBranchId = (order: Order): string | null => {
    const raw = order.branchId?.trim();
    const resolved =
      !raw || raw.length === 0 ? LEGACY_DEFAULT_BRANCH_ID : raw;
    return branchSales[resolved] !== undefined ? resolved : null;
  };

  for (const order of orders) {
    const branchId = resolveOrderBranchId(order);
    if (branchId === null) {
      if (orderInPeriod(order, period, now)) {
        unassignedSales += order.total;
        unassignedTx += 1;
      }
      continue;
    }
    if (orderInPeriod(order, period, now)) {
      branchSales[branchId] += order.total;
      branchTx[branchId] += 1;
      if (order.paymentMethod === "cash") branchCash[branchId] += order.total;
      if (order.paymentMethod === "qris") branchQris[branchId] += order.total;
    }
    if (orderInPeriod(order, period, previousRef)) {
      prevBranchSales[branchId] += order.total;
    }
  }

  const totalSales =
    Object.values(branchSales).reduce((a, b) => a + b, 0) + unassignedSales;
  const totalTransactions =
    Object.values(branchTx).reduce((a, b) => a + b, 0) + unassignedTx;

  const recaps: BranchRecap[] = [];
  for (const branch of branches.filter((b) => b.isActive)) {
    const sales = branchSales[branch.id] ?? 0;
    const prev = prevBranchSales[branch.id] ?? 0;
    let growth: number | undefined;
    if (prev > 0) growth = ((sales - prev) / prev) * 100;
    else if (sales > 0) growth = 100;

    recaps.push({
      branchId: branch.id,
      branchName: branch.name,
      totalSales: sales,
      transactionCount: branchTx[branch.id] ?? 0,
      cashSales: branchCash[branch.id] ?? 0,
      qrisSales: branchQris[branch.id] ?? 0,
      growthPercent: growth,
      sharePercent: totalSales > 0 ? (sales / totalSales) * 100 : 0,
      rank: 0,
    });
  }

  recaps.sort((a, b) => b.totalSales - a.totalSales);
  const ranked = recaps.map((r, i) => ({ ...r, rank: i + 1 }));

  return {
    period,
    branches: ranked,
    totalSales,
    totalTransactions,
  };
}

export function periodCaption(period: InsightPeriod, now: Date): string {
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

export function recapLabel(period: InsightPeriod): string {
  switch (period) {
    case "today":
      return "Recap Hari Ini";
    case "week":
      return "Recap Minggu";
    case "month":
      return "Recap Bulan";
    case "year":
      return "Recap Tahun";
  }
}
