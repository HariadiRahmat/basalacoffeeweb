import { branchDisplayName, matchesBranchScope } from "@/lib/branch-scope";
import { orderInReportRange, previousReportRange, ReportDateRange } from "@/lib/reports/date-range";
import { Branch, Order, TopProduct } from "@/lib/types";

export interface BranchSalesRow {
  branchId: string;
  branchName: string;
  totalSales: number;
  transactionCount: number;
  cashSales: number;
  qrisSales: number;
  sharePercent: number;
}

export interface FinancialReportData {
  range: ReportDateRange;
  branchFilter: string | null;
  branchLabel: string;
  generatedAt: Date;
  orders: Order[];
  transactionCount: number;
  totalSales: number;
  averageOrderValue: number;
  cashSales: number;
  qrisSales: number;
  cashTransactions: number;
  qrisTransactions: number;
  totalItemsSold: number;
  previousTotalSales: number;
  previousTransactionCount: number;
  salesTrendPercent: number;
  transactionTrendPercent: number;
  branchRows: BranchSalesRow[];
  topProducts: TopProduct[];
}

function filterCompletedOrders(
  orders: Order[],
  range: ReportDateRange,
  branchFilter: string | null,
): Order[] {
  return orders.filter(
    (o) =>
      o.status === "completed" &&
      orderInReportRange(o.createdAt, range) &&
      (!branchFilter || matchesBranchScope(o.branchId, branchFilter)),
  );
}

function sumSales(orders: Order[]): number {
  return orders.reduce((s, o) => s + o.total, 0);
}

function buildTopProducts(orders: Order[]): TopProduct[] {
  const stats = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const order of orders) {
    for (const line of order.lines) {
      const cur = stats.get(line.menuItemId);
      stats.set(line.menuItemId, {
        name: line.name,
        qty: (cur?.qty ?? 0) + line.quantity,
        revenue: (cur?.revenue ?? 0) + line.subtotal,
      });
    }
  }
  return [...stats.entries()]
    .map(([menuItemId, v]) => ({
      menuItemId,
      name: v.name,
      quantitySold: v.qty,
      revenue: v.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

function buildBranchRows(
  orders: Order[],
  branches: Branch[],
  totalSales: number,
): BranchSalesRow[] {
  const lookup = new Map(branches.map((b) => [b.id, b.name]));
  const byBranch = new Map<
    string,
    { sales: number; tx: number; cash: number; qris: number }
  >();

  for (const order of orders) {
    const id = order.branchId?.trim() || "branch-1";
    const cur = byBranch.get(id) ?? { sales: 0, tx: 0, cash: 0, qris: 0 };
    cur.sales += order.total;
    cur.tx += 1;
    if (order.paymentMethod === "cash") cur.cash += order.total;
    if (order.paymentMethod === "qris") cur.qris += order.total;
    byBranch.set(id, cur);
  }

  return [...byBranch.entries()]
    .map(([branchId, v]) => ({
      branchId,
      branchName: branchDisplayName(lookup, branchId),
      totalSales: v.sales,
      transactionCount: v.tx,
      cashSales: v.cash,
      qrisSales: v.qris,
      sharePercent: totalSales > 0 ? (v.sales / totalSales) * 100 : 0,
    }))
    .sort((a, b) => b.totalSales - a.totalSales);
}

function trendPercent(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function buildFinancialReportData(
  orders: Order[],
  branches: Branch[],
  branchFilter: string | null,
  range: ReportDateRange,
  branchLabel: string,
): FinancialReportData {
  const filtered = filterCompletedOrders(orders, range, branchFilter);
  const prevRange = previousReportRange(range);
  const previous = filterCompletedOrders(orders, prevRange, branchFilter);

  const transactionCount = filtered.length;
  const totalSales = sumSales(filtered);
  const previousTotalSales = sumSales(previous);
  const previousTransactionCount = previous.length;

  const cashOrders = filtered.filter((o) => o.paymentMethod === "cash");
  const qrisOrders = filtered.filter((o) => o.paymentMethod === "qris");

  return {
    range,
    branchFilter,
    branchLabel,
    generatedAt: new Date(),
    orders: filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    transactionCount,
    totalSales,
    averageOrderValue: transactionCount > 0 ? totalSales / transactionCount : 0,
    cashSales: cashOrders.reduce((s, o) => s + o.total, 0),
    qrisSales: qrisOrders.reduce((s, o) => s + o.total, 0),
    cashTransactions: cashOrders.length,
    qrisTransactions: qrisOrders.length,
    totalItemsSold: filtered.reduce(
      (s, o) => s + o.lines.reduce((ls, l) => ls + l.quantity, 0),
      0,
    ),
    previousTotalSales,
    previousTransactionCount,
    salesTrendPercent: trendPercent(totalSales, previousTotalSales),
    transactionTrendPercent: trendPercent(transactionCount, previousTransactionCount),
    branchRows: buildBranchRows(filtered, branches, totalSales),
    topProducts: buildTopProducts(filtered).slice(0, 10),
  };
}

export function paymentMethodLabel(method?: string): string {
  if (method === "cash") return "Tunai";
  if (method === "qris") return "QRIS";
  return method ?? "—";
}

export function formatReportDateTime(d: Date): string {
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatReportDate(d: Date): string {
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
