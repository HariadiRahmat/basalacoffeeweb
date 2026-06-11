"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardGrid, PageSection } from "@/components/dashboard-layout";
import { FeatureIcon, FeatureIconName } from "@/components/feature-icon";
import { useBranchFilter } from "@/lib/branch-filter-context";
import { listIngredients } from "@/lib/inventory-api";
import type { Ingredient } from "@/lib/inventory-api";

const LINKS: {
  href: string;
  label: string;
  desc: string;
  icon: FeatureIconName;
}[] = [
  { href: "/dashboard/inventory/ingredients", label: "Master Bahan Baku", desc: "Kelola bahan & stok minimum", icon: "ingredients" },
  { href: "/dashboard/inventory/recipes", label: "Resep Menu", desc: "Komposisi bahan per menu", icon: "recipes" },
  { href: "/dashboard/inventory/stock-in", label: "Penerimaan Barang", desc: "Catat barang masuk", icon: "stock-in" },
  { href: "/dashboard/inventory/adjustment", label: "Penyesuaian Stok", desc: "Koreksi, rusak, expired", icon: "adjustment" },
  { href: "/dashboard/inventory/opname", label: "Stock Opname", desc: "Hitung fisik stok", icon: "opname" },
  { href: "/dashboard/inventory/movements", label: "Riwayat Pergerakan", desc: "Log IN/OUT/ADJUSTMENT", icon: "movements" },
];

export function InventoryHubDashboard() {
  const { branchFilter, branchName } = useBranchFilter();
  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!branchFilter) {
      setItems([]);
      return;
    }
    setLoading(true);
    listIngredients(branchFilter)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [branchFilter]);

  const lowStock = items.filter((i) => i.current_stock <= i.minimum_stock);

  return (
    <div className="dashboard-page">
      {branchFilter ? (
        <div className="menu-toolbar">
          <FeatureIcon name="store" className="h-4 w-4 shrink-0 text-[var(--forest)]" />
          <span className="text-sm font-semibold text-[var(--ink)]">{branchName(branchFilter)}</span>
          <span className="chip shrink-0">{loading ? "…" : `${items.length} bahan`}</span>
          {lowStock.length > 0 && (
            <span className="chip shrink-0 !bg-red-50 !text-[var(--red)]">{lowStock.length} menipis</span>
          )}
        </div>
      ) : (
        <div className="inventory-hint">
          <FeatureIcon name="store" className="h-4 w-4 shrink-0" />
          <p>Pilih outlet di toolbar atas untuk melihat ringkasan inventory.</p>
        </div>
      )}

      {branchFilter && (
        <>
          <DashboardGrid cols={3}>
            <div className="card card-compact">
              <p className="text-xs text-[var(--caption)]">Total Bahan</p>
              <p className="text-2xl font-bold">{loading ? "…" : items.length}</p>
            </div>
            <div className="card card-compact">
              <p className="text-xs text-[var(--caption)]">Stok Menipis</p>
              <p className="text-2xl font-bold text-[var(--red)]">{loading ? "…" : lowStock.length}</p>
            </div>
            <div className="card card-compact">
              <p className="text-xs text-[var(--caption)]">Status</p>
              <p className="text-sm font-semibold">{loading ? "Memuat…" : "Siap kelola"}</p>
            </div>
          </DashboardGrid>

          {lowStock.length > 0 && (
            <div className="inventory-hint inventory-hint--warn">
              <FeatureIcon name="adjustment" className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold">Stok menipis</p>
                <ul className="mt-1 space-y-0.5 text-xs opacity-90">
                  {lowStock.slice(0, 5).map((i) => (
                    <li key={i.id}>
                      {i.name}: {i.current_stock} {i.unit} (min {i.minimum_stock})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      <PageSection title="Modul Inventory" subtitle="Selaras dengan aplikasi mobile owner">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="menu-tile">
              <div className="menu-tile-icon">
                <FeatureIcon name={item.icon} />
              </div>
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs text-[var(--caption)]">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
