import { startOfDay } from "@/lib/analytics/branch-insights";

export type ReportPreset = "today" | "week" | "month" | "year" | "custom";

export interface ReportDateRange {
  preset: ReportPreset;
  start: Date;
  end: Date;
  label: string;
  filenameSuffix: string;
}

const PRESET_LABELS: Record<Exclude<ReportPreset, "custom">, string> = {
  today: "Hari ini",
  week: "Minggu ini",
  month: "Bulan ini",
  year: "Tahun ini",
};

function formatDateId(d: Date): string {
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseInputDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function resolveReportDateRange(
  preset: ReportPreset,
  now = new Date(),
  customStart?: string,
  customEnd?: string,
): ReportDateRange {
  const today = startOfDay(now);

  if (preset === "custom") {
    const start = parseInputDate(customStart ?? "");
    const end = parseInputDate(customEnd ?? "");
    if (!start || !end) {
      throw new Error("Pilih tanggal mulai dan tanggal akhir.");
    }
    if (start > end) {
      throw new Error("Tanggal mulai tidak boleh setelah tanggal akhir.");
    }
    const label =
      isoDate(start) === isoDate(end)
        ? formatDateId(start)
        : `${formatDateId(start)} – ${formatDateId(end)}`;
    return {
      preset,
      start,
      end,
      label,
      filenameSuffix: `${isoDate(start)}_${isoDate(end)}`,
    };
  }

  let start = today;
  const end = today;

  switch (preset) {
    case "today":
      break;
    case "week":
      start = new Date(today);
      start.setDate(start.getDate() - 6);
      break;
    case "month":
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case "year":
      start = new Date(today.getFullYear(), 0, 1);
      break;
  }

  return {
    preset,
    start,
    end,
    label: PRESET_LABELS[preset],
    filenameSuffix: `${preset}_${isoDate(end)}`,
  };
}

export function orderInReportRange(orderDate: Date, range: ReportDateRange): boolean {
  const rangeStart = startOfDay(range.start);
  const rangeEndExclusive = startOfDay(range.end);
  rangeEndExclusive.setDate(rangeEndExclusive.getDate() + 1);
  return orderDate >= rangeStart && orderDate < rangeEndExclusive;
}

export function previousReportRange(range: ReportDateRange): ReportDateRange {
  const startDay = startOfDay(range.start).getTime();
  const endDay = startOfDay(range.end).getTime();
  const spanDays = Math.round((endDay - startDay) / 86400000) + 1;

  const prevEnd = new Date(startDay);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (spanDays - 1));

  return {
    preset: range.preset,
    start: prevStart,
    end: prevEnd,
    label: `Periode sebelumnya (${formatDateId(prevStart)} – ${formatDateId(prevEnd)})`,
    filenameSuffix: range.filenameSuffix,
  };
}
