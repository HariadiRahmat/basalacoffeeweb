"use client";

import { useEffect, useState } from "react";
import { fetchCustomers } from "@/lib/firestore-data";
import { Customer } from "@/lib/types";

export function CustomersDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers()
      .then(setCustomers)
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--lime)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="menu-toolbar">
        <span className="chip">{customers.length} pelanggan</span>
      </div>

      {error && <p className="text-sm text-[var(--red)]">{error}</p>}

      {customers.length === 0 ? (
        <div className="menu-list">
          <p className="menu-empty">Pelanggan akan muncul setelah transaksi.</p>
        </div>
      ) : (
        <div className="menu-list">
          {customers.map((c) => (
            <div key={c.id} className="menu-row">
              <div className="customer-avatar">{c.name.charAt(0).toUpperCase()}</div>
              <div className="menu-row-main">
                <p className="menu-row-name">{c.name}</p>
                <p className="menu-row-meta">{c.phone ?? c.email ?? "—"}</p>
              </div>
              <span className="customer-stat hidden sm:inline">{c.totalPurchases} trx</span>
              <span className="chip shrink-0">{c.loyaltyPoints} poin</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
