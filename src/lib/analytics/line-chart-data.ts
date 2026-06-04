import { orderInPeriod, startOfDay } from "@/lib/analytics/branch-insights";
import {
  BranchRecap,
  InsightPeriod,
  LEGACY_DEFAULT_BRANCH_ID,
  MultiStoreChartData,
  Order,
} from "@/lib/types";

const LINE_COLORS = [
  "#141C1B",
  "#C1E256",
  "#2D4636",
  "#A8CA3F",
  "#2D4636",
  "#8A9691",
];

function resolveOrderBranchId(
  raw: string | undefined,
  knownIds: Set<string>,
): string | null {
  const id = raw?.trim();
  const resolved = !id || id.length === 0 ? LEGACY_DEFAULT_BRANCH_ID : id;
  return knownIds.has(resolved) ? resolved : null;
}

function bucketLabels(period: InsightPeriod, now: Date): string[] {
  switch (period) {
    case "today":
      return ["08", "10", "12", "14", "16", "18"];
    case "week": {
      const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      const todayStart = startOfDay(now);
      return Array.from({ length: 7 }, (_, index) => {
        const day = new Date(todayStart);
        day.setDate(day.getDate() - (6 - index));
        return labels[day.getDay() === 0 ? 6 : day.getDay() - 1];
      });
    }
    case "month": {
      const daysInMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      ).getDate();
      const weekCount = Math.floor((daysInMonth - 1) / 7) + 1;
      return Array.from({ length: weekCount }, (_, i) => `W${i + 1}`);
    }
    case "year":
      return [
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
  }
}

function bucketRange(
  period: InsightPeriod,
  now: Date,
  bucketIndex: number,
): { start: Date; end: Date } {
  switch (period) {
    case "today": {
      const dayStart = startOfDay(now);
      const hourStarts = [8, 10, 12, 14, 16, 18];
      const h = hourStarts[Math.min(bucketIndex, hourStarts.length - 1)];
      const start = new Date(dayStart);
      start.setHours(h, 0, 0, 0);
      const end = new Date(dayStart);
      end.setHours(h + 2, 0, 0, 0);
      return { start, end };
    }
    case "week": {
      const todayStart = startOfDay(now);
      const day = new Date(todayStart);
      day.setDate(day.getDate() - (6 - bucketIndex));
      const end = new Date(day);
      end.setDate(end.getDate() + 1);
      return { start: day, end };
    }
    case "month": {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const weekStart = new Date(monthStart);
      weekStart.setDate(weekStart.getDate() + bucketIndex * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return { start: weekStart, end: weekEnd };
    }
    case "year": {
      const monthStart = new Date(now.getFullYear(), bucketIndex, 1);
      const monthEnd = new Date(now.getFullYear(), bucketIndex + 1, 1);
      return { start: monthStart, end: monthEnd };
    }
  }
}

export function buildMultiStoreChartData(
  period: InsightPeriod,
  branches: BranchRecap[],
  orders: Order[],
  now = new Date(),
): MultiStoreChartData | null {
  if (branches.length === 0) return null;

  const branchIds = new Set(branches.map((b) => b.branchId));
  const completed = orders.filter((o) => {
    if (o.status !== "completed") return false;
    if (!orderInPeriod(o, period, now)) return false;
    return resolveOrderBranchId(o.branchId, branchIds) !== null;
  });

  const labels = bucketLabels(period, now);
  if (labels.length === 0) return null;

  const series = branches.map((branch, i) => ({
    branchId: branch.branchId,
    branchName: branch.branchName,
    color: LINE_COLORS[i % LINE_COLORS.length],
    values: labels.map((_, bucketIndex) => {
      const range = bucketRange(period, now, bucketIndex);
      return completed
        .filter(
          (o) =>
            resolveOrderBranchId(o.branchId, branchIds) === branch.branchId &&
            o.createdAt >= range.start &&
            o.createdAt < range.end,
        )
        .reduce((sum, o) => sum + o.total, 0);
    }),
  }));

  return { labels, series };
}
