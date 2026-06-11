import * as XLSX from "xlsx";
import {
  FinancialReportData,
  formatReportDate,
  paymentMethodLabel,
} from "@/lib/reports/financial-report-data";
import { Branch } from "@/lib/types";
import { branchDisplayName } from "@/lib/branch-scope";

function buildFilename(data: FinancialReportData, suffix: string): string {
  return `CoffeeBasala_${suffix}_${data.range.filenameSuffix}.xlsx`;
}

export function exportRawFinancialExcel(
  data: FinancialReportData,
  branches: Branch[],
): void {
  const lookup = new Map(branches.map((b) => [b.id, b.name]));
  const wb = XLSX.utils.book_new();

  const transactionRows = data.orders.map((o) => ({
    "No. Order": o.orderNumber,
    "ID Order": o.id,
    Tanggal: formatReportDate(o.createdAt),
    Toko: branchDisplayName(lookup, o.branchId),
    Pembayaran: paymentMethodLabel(o.paymentMethod),
    Total: o.total,
    "Jumlah Item": o.lines.reduce((s, l) => s + l.quantity, 0),
    Status: o.status,
  }));

  const lineRows = data.orders.flatMap((o) =>
    o.lines.map((line) => ({
      "No. Order": o.orderNumber,
      Tanggal: formatReportDate(o.createdAt),
      Toko: branchDisplayName(lookup, o.branchId),
      Menu: line.name,
      Qty: line.quantity,
      "Harga Satuan": line.unitPrice,
      Subtotal: line.subtotal,
    })),
  );

  const summaryRows = [
    { Metrik: "Periode", Nilai: data.range.label },
    { Metrik: "Toko", Nilai: data.branchLabel },
    { Metrik: "Total Penjualan", Nilai: data.totalSales },
    { Metrik: "Jumlah Transaksi", Nilai: data.transactionCount },
    { Metrik: "Rata-rata Order", Nilai: Math.round(data.averageOrderValue) },
    { Metrik: "Penjualan Tunai", Nilai: data.cashSales },
    { Metrik: "Penjualan QRIS", Nilai: data.qrisSales },
    { Metrik: "Transaksi Tunai", Nilai: data.cashTransactions },
    { Metrik: "Transaksi QRIS", Nilai: data.qrisTransactions },
    { Metrik: "Total Item Terjual", Nilai: data.totalItemsSold },
    { Metrik: "Trend Penjualan (%)", Nilai: Math.round(data.salesTrendPercent * 10) / 10 },
    { Metrik: "Trend Transaksi (%)", Nilai: Math.round(data.transactionTrendPercent * 10) / 10 },
    { Metrik: "Diekspor pada", Nilai: formatReportDate(data.generatedAt) },
  ];

  const branchRows = data.branchRows.map((b) => ({
    Toko: b.branchName,
    "Total Penjualan": b.totalSales,
    Transaksi: b.transactionCount,
    Tunai: b.cashSales,
    QRIS: b.qrisSales,
    "Share (%)": Math.round(b.sharePercent * 10) / 10,
  }));

  const productRows = data.topProducts.map((p, i) => ({
    Peringkat: i + 1,
    Menu: p.name,
    "Qty Terjual": p.quantitySold,
    Pendapatan: p.revenue,
  }));

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(transactionRows),
    "Transaksi",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(lineRows.length ? lineRows : [{ Info: "Tidak ada data" }]),
    "Detail Item",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(summaryRows),
    "Ringkasan",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(branchRows.length ? branchRows : [{ Info: "Tidak ada data" }]),
    "Per Toko",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(productRows.length ? productRows : [{ Info: "Tidak ada data" }]),
    "Menu Terlaris",
  );

  XLSX.writeFile(wb, buildFilename(data, "Data_Raw"));
}
