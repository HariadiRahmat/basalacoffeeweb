"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageSection } from "@/components/dashboard-layout";
import { useDashboardData } from "@/lib/dashboard-data-context";
import { fetchOrderById, updateOrderStatus } from "@/lib/firestore-data";
import { formatIdr } from "@/lib/format";
import { ORDER_STATUS_LABELS, Order, OrderStatus } from "@/lib/types";

export function OrderDetailDashboard({ orderId }: { orderId: string }) {
  const { refresh } = useDashboardData();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchOrderById(orderId);
      setOrder(data);
      setError(data ? null : "Pesanan tidak ditemukan");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const setStatus = async (status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    await refresh();
    await load();
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--lime)] border-t-transparent" />
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="card p-6">
        <p className="text-[var(--red)]">{error ?? "Pesanan tidak ditemukan"}</p>
        <Link href="/dashboard/transactions" className="btn-outline mt-4 inline-block">
          Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Link href="/dashboard/transactions" className="text-sm font-semibold text-[var(--forest)]">
        ← Kembali ke transaksi
      </Link>

      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xl font-bold">{order.orderNumber}</p>
            <p className="text-sm text-[var(--caption)]">
              {order.createdAt.toLocaleString("id-ID")} · {ORDER_STATUS_LABELS[order.status]}
            </p>
          </div>
          <p className="text-2xl font-bold">{formatIdr(order.total)}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {order.status === "new" && (
            <button type="button" className="btn-primary" onClick={() => setStatus("processing")}>
              Mulai Proses
            </button>
          )}
          {order.status === "processing" && (
            <button type="button" className="btn-primary" onClick={() => setStatus("ready")}>
              Tandai Siap
            </button>
          )}
          {order.status === "ready" && (
            <button type="button" className="btn-primary" onClick={() => setStatus("completed")}>
              Selesaikan
            </button>
          )}
        </div>
      </div>

      <PageSection title="Item Pesanan">
        <div className="card card-flat divide-y divide-[var(--border)]">
          {order.lines.map((line, i) => (
            <div key={i} className="flex justify-between px-4 py-3 text-sm">
              <span>
                {line.quantity}x {line.name}
              </span>
              <span className="font-semibold">{formatIdr(line.subtotal)}</span>
            </div>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
