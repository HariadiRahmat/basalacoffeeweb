"use client";

import { useMemo, useState } from "react";
import { FeatureIcon } from "@/components/feature-icon";
import { useBranchFilter } from "@/lib/branch-filter-context";
import { useDashboardData } from "@/lib/dashboard-data-context";
import { formatIdr } from "@/lib/format";
import { ReportPreset, resolveReportDateRange } from "@/lib/reports/date-range";
import { buildFinancialReportData } from "@/lib/reports/financial-report-data";
import { exportRawFinancialExcel } from "@/lib/reports/export-raw-excel";
import { exportFinancialReportPdf } from "@/lib/reports/export-report-pdf";

const PRESETS: { id: ReportPreset; label: string }[] = [
  { id: "today", label: "Hari ini" },
  { id: "week", label: "Minggu ini" },
  { id: "month", label: "Bulan ini" },
  { id: "year", label: "Tahun ini" },
  { id: "custom", label: "Tanggal" },
];

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ReportsDashboard() {
  const { branchFilter, branchName, branches } = useBranchFilter();
  const { orders, loading } = useDashboardData();
  const [preset, setPreset] = useState<ReportPreset>("month");
  const [customStart, setCustomStart] = useState(isoToday());
  const [customEnd, setCustomEnd] = useState(isoToday());
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"raw" | "pdf" | null>(null);

  const branchLabel = branchFilter ? branchName(branchFilter) : "Semua toko";

  const reportData = useMemo(() => {
    try {
      const range = resolveReportDateRange(
        preset,
        new Date(),
        customStart,
        customEnd,
      );
      return buildFinancialReportData(orders, branches, branchFilter, range, branchLabel);
    } catch {
      return null;
    }
  }, [orders, branches, branchFilter, branchLabel, preset, customStart, customEnd]);

  const handleExportRaw = () => {
    if (!reportData) return;
    setError(null);
    setExporting("raw");
    try {
      exportRawFinancialExcel(reportData, branches);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal export Excel");
    } finally {
      setExporting(null);
    }
  };

  const handleExportPdf = () => {
    if (!reportData) return;
    setError(null);
    setExporting("pdf");
    try {
      exportFinancialReportPdf(reportData, branches);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal export PDF");
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--lime)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <section className="loyalty-card">
        <div className="loyalty-card-head">
          <div className="loyalty-card-icon loyalty-card-icon--program">
            <FeatureIcon name="file-report" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="loyalty-card-title">Rentang Data</h2>
            <p className="loyalty-card-desc">Pilih periode laporan keuangan · {branchLabel}</p>
          </div>
        </div>

        <div className="loyalty-card-body space-y-4">
          <div className="report-period-track">
            {PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`control-pill ${preset === item.id ? "control-pill-active" : ""}`}
                onClick={() => setPreset(item.id)}
              >
                <span className="control-pill-text">{item.label}</span>
              </button>
            ))}
          </div>

          {preset === "custom" && (
            <div className="form-grid">
              <label className="form-field">
                <span className="form-label">Dari tanggal</span>
                <input
                  type="date"
                  className="input"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              </label>
              <label className="form-field">
                <span className="form-label">Sampai tanggal</span>
                <input
                  type="date"
                  className="input"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                />
              </label>
            </div>
          )}
        </div>
      </section>

      {reportData && (
        <section className="card">
          <p className="text-xs font-semibold text-[var(--forest)]">Pratinjau ringkas</p>
          <p className="mt-1 text-sm text-[var(--caption)]">{reportData.range.label}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <PreviewStat label="Penjualan" value={formatIdr(reportData.totalSales)} />
            <PreviewStat label="Transaksi" value={String(reportData.transactionCount)} />
            <PreviewStat label="Tunai" value={formatIdr(reportData.cashSales)} />
            <PreviewStat label="QRIS" value={formatIdr(reportData.qrisSales)} />
          </div>
          {reportData.transactionCount === 0 && (
            <p className="mt-3 text-xs text-[var(--caption)]">
              Tidak ada transaksi selesai pada periode ini. File tetap bisa diunduh dengan data kosong.
            </p>
          )}
        </section>
      )}

      {error && <p className="text-sm text-[var(--red)]">{error}</p>}

      <section className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          className="report-download-card"
          disabled={!reportData || exporting !== null}
          onClick={handleExportRaw}
        >
          <div className="report-download-icon report-download-icon--excel">
            <FeatureIcon name="download" className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-bold">Data Raw (Excel)</p>
            <p className="text-xs text-[var(--caption)]">
              Transaksi, detail item, ringkasan, per toko, menu terlaris
            </p>
          </div>
          <span className="report-download-badge">.xlsx</span>
          {exporting === "raw" && <span className="text-xs text-[var(--caption)]">Menyiapkan...</span>}
        </button>

        <button
          type="button"
          className="report-download-card"
          disabled={!reportData || exporting !== null}
          onClick={handleExportPdf}
        >
          <div className="report-download-icon report-download-icon--pdf">
            <FeatureIcon name="file-report" className="h-5 w-5" />
          </div>
          <div className="min-w-0 text-left">
            <p className="font-bold">Laporan Keuangan (PDF)</p>
            <p className="text-xs text-[var(--caption)]">
              Ringkasan eksekutif, pembayaran, toko, menu terlaris, transaksi
            </p>
          </div>
          <span className="report-download-badge">.pdf</span>
          {exporting === "pdf" && <span className="text-xs text-[var(--caption)]">Menyiapkan...</span>}
        </button>
      </section>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--bg)] px-3 py-2">
      <p className="text-[10px] text-[var(--caption)]">{label}</p>
      <p className="text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}
