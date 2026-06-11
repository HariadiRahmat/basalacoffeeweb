import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FinancialReportData,
  formatReportDateTime,
  paymentMethodLabel,
} from "@/lib/reports/financial-report-data";
import { formatIdr } from "@/lib/format";
import { branchDisplayName } from "@/lib/branch-scope";
import { Branch } from "@/lib/types";

const FOREST: [number, number, number] = [45, 70, 54];
const INK: [number, number, number] = [20, 28, 27];
const CAPTION: [number, number, number] = [138, 150, 145];
const LIME: [number, number, number] = [193, 226, 86];

type AutoTableDoc = jsPDF & { lastAutoTable?: { finalY: number } };

function tableEndY(doc: AutoTableDoc, fallback: number): number {
  return doc.lastAutoTable?.finalY ?? fallback;
}

function trendText(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${Math.round(value)}% vs periode sebelumnya`;
}

export function exportFinancialReportPdf(
  data: FinancialReportData,
  branches: Branch[],
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" }) as AutoTableDoc;
  const lookup = new Map(branches.map((b) => [b.id, b.name]));
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  doc.setFillColor(...FOREST);
  doc.rect(0, 0, pageWidth, 34, "F");
  doc.setTextColor(...LIME);
  doc.setFontSize(10);
  doc.text("COFFEE BASALA", 14, 12);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("Laporan Keuangan", 14, 22);
  doc.setFontSize(9);
  doc.text(`Periode: ${data.range.label}`, 14, 29);

  y = 44;
  doc.setTextColor(...CAPTION);
  doc.setFontSize(9);
  doc.text(`Toko: ${data.branchLabel}`, 14, y);
  y += 5;
  doc.text(`Dibuat: ${formatReportDateTime(data.generatedAt)}`, 14, y);
  y += 10;

  doc.setTextColor(...INK);
  doc.setFontSize(12);
  doc.text("Ringkasan Eksekutif", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: FOREST, textColor: [255, 255, 255] },
    head: [["Indikator", "Nilai"]],
    body: [
      ["Total Penjualan", formatIdr(data.totalSales)],
      ["Jumlah Transaksi", String(data.transactionCount)],
      ["Rata-rata Order", formatIdr(data.averageOrderValue)],
      ["Item Terjual", String(data.totalItemsSold)],
      ["Trend Penjualan", trendText(data.salesTrendPercent)],
      ["Trend Transaksi", trendText(data.transactionTrendPercent)],
    ],
    margin: { left: 14, right: 14 },
  });

  y = tableEndY(doc, y) + 8;
  doc.setFontSize(12);
  doc.text("Metode Pembayaran", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Metode", "Transaksi", "Nominal", "Share"]],
    body: [
      [
        "Tunai",
        String(data.cashTransactions),
        formatIdr(data.cashSales),
        data.totalSales > 0 ? `${Math.round((data.cashSales / data.totalSales) * 100)}%` : "0%",
      ],
      [
        "QRIS",
        String(data.qrisTransactions),
        formatIdr(data.qrisSales),
        data.totalSales > 0 ? `${Math.round((data.qrisSales / data.totalSales) * 100)}%` : "0%",
      ],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: FOREST, textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  });

  y = tableEndY(doc, y) + 8;

  if (data.branchRows.length > 0 && !data.branchFilter) {
    doc.setFontSize(12);
    doc.text("Penjualan per Toko", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Toko", "Trx", "Penjualan", "Tunai", "QRIS", "Share"]],
      body: data.branchRows.map((b) => [
        b.branchName,
        String(b.transactionCount),
        formatIdr(b.totalSales),
        formatIdr(b.cashSales),
        formatIdr(b.qrisSales),
        `${Math.round(b.sharePercent)}%`,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: FOREST, textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 },
    });
    y = tableEndY(doc, y) + 8;
  }

  if (data.topProducts.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.text("Menu Terlaris", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["#", "Menu", "Qty", "Pendapatan", "Share"]],
      body: data.topProducts.map((p, i) => [
        String(i + 1),
        p.name,
        String(p.quantitySold),
        formatIdr(p.revenue),
        data.totalSales > 0 ? `${Math.round((p.revenue / data.totalSales) * 100)}%` : "0%",
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: FOREST, textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 },
    });
    y = tableEndY(doc, y) + 8;
  }

  if (data.orders.length > 0) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(12);
    doc.text("Daftar Transaksi", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["No. Order", "Tanggal", "Toko", "Bayar", "Total"]],
      body: data.orders.slice(0, 50).map((o) => [
        o.orderNumber,
        formatReportDateTime(o.createdAt),
        branchDisplayName(lookup, o.branchId),
        paymentMethodLabel(o.paymentMethod),
        formatIdr(o.total),
      ]),
      styles: { fontSize: 7 },
      headStyles: { fillColor: FOREST, textColor: [255, 255, 255] },
      margin: { left: 14, right: 14 },
    });
    if (data.orders.length > 50) {
      doc.setFontSize(8);
      doc.setTextColor(...CAPTION);
      doc.text(
        `Menampilkan 50 dari ${data.orders.length} transaksi. Unduh Excel untuk data lengkap.`,
        14,
        tableEndY(doc, y) + 6,
      );
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...CAPTION);
    doc.text(
      `Coffee Basala Owner Dashboard · Halaman ${i}/${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 8,
    );
  }

  doc.save(`CoffeeBasala_Laporan_Keuangan_${data.range.filenameSuffix}.pdf`);
}
