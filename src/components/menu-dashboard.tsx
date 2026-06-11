"use client";

import { FormEvent, useEffect, useState } from "react";
import { FeatureIcon } from "@/components/feature-icon";
import { resolveMenuBranchId } from "@/lib/branch-scope";
import { useBranchFilter } from "@/lib/branch-filter-context";
import { useDashboardData } from "@/lib/dashboard-data-context";
import {
  defaultCupSizesForCategory,
  deleteMenuItem,
  menuPriceLabel,
  upsertMenuItem,
} from "@/lib/firestore-data";
import {
  MenuCategory,
  MENU_CATEGORY_LABELS,
  MenuCupSize,
  MenuItem,
} from "@/lib/types";

interface MenuFormModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onSaved: () => void;
}

function slugId(label: string, index: number): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return base || `ukuran_${index}`;
}

function MenuFormModal({ item, onClose, onSaved }: MenuFormModalProps) {
  const { branchFilter, branches, branchName } = useBranchFilter();
  const isEditing = item != null;
  const [name, setName] = useState(item?.name ?? "");
  const [code, setCode] = useState(item?.code ?? "");
  const [category, setCategory] = useState<MenuCategory>(item?.category ?? "coffee");
  const [stock, setStock] = useState(String(item?.stock ?? 0));
  const [description, setDescription] = useState(item?.description ?? "");
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);
  const [branchId, setBranchId] = useState(
    item?.branchId ?? branchFilter ?? "",
  );
  const [sizes, setSizes] = useState<MenuCupSize[]>(
    item?.cupSizes?.length
      ? item.cupSizes
      : defaultCupSizesForCategory(item?.category ?? "coffee"),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setSizes(defaultCupSizesForCategory(category));
    }
  }, [category, isEditing]);

  const updateSize = (index: number, patch: Partial<MenuCupSize>) => {
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  };

  const addSize = () => {
    setSizes((prev) => [
      ...prev,
      { id: `ukuran_${prev.length}`, label: "", price: 0 },
    ]);
  };

  const removeSize = (index: number) => {
    if (sizes.length <= 1) return;
    setSizes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const resolvedBranch = resolveMenuBranchId(branchFilter, branchId);
    if (!resolvedBranch) {
      setError("Pilih toko untuk menu ini.");
      return;
    }
    const parsedSizes = sizes
      .map((s, i) => ({
        ...s,
        id: slugId(s.label || `ukuran_${i}`, i),
        label: s.label.trim(),
        price: Number(s.price),
      }))
      .filter((s) => s.label && s.price > 0);
    if (parsedSizes.length === 0) {
      setError("Lengkapi label dan harga setiap ukuran.");
      return;
    }
    const listPrice = Math.min(...parsedSizes.map((s) => s.price));
    setSaving(true);
    try {
      await upsertMenuItem({
        id: item?.id ?? "",
        name: name.trim(),
        code: code.trim() || undefined,
        category,
        price: listPrice,
        description: description.trim() || undefined,
        isAvailable,
        stock: Number(stock) || 0,
        branchId: resolvedBranch,
        cupSizes: parsedSizes,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[22px] bg-[var(--surface)] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {isEditing ? "Edit Menu" : "Tambah Menu"}
          </h2>
          <button type="button" className="btn-outline px-3 py-1.5 text-xs" onClick={onClose}>
            Tutup
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <label className="block text-xs font-semibold text-[var(--caption)]">
              Toko
              <select
                className="input mt-1"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Pilih toko
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              {branchFilter && (
                <span className="mt-1 block text-[10px]">
                  Filter aktif: {branchName(branchFilter)}
                </span>
              )}
            </label>
          )}

          {isEditing && item?.branchId && (
            <p className="rounded-xl bg-[var(--lime-track)] px-3 py-2 text-xs font-semibold text-[var(--forest)]">
              Toko: {branchName(item.branchId)}
            </p>
          )}

          <label className="block text-xs font-semibold text-[var(--caption)]">
            Nama menu
            <input
              className="input mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[var(--caption)]">
              Kode (opsional)
              <input
                className="input mt-1"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </label>
            <label className="block text-xs font-semibold text-[var(--caption)]">
              Stok
              <input
                className="input mt-1"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-[var(--caption)]">
            Kategori
            <select
              className="input mt-1"
              value={category}
              onChange={(e) => setCategory(e.target.value as MenuCategory)}
            >
              {(Object.keys(MENU_CATEGORY_LABELS) as MenuCategory[]).map((c) => (
                <option key={c} value={c}>
                  {MENU_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--caption)]">Ukuran & Harga</p>
              <button type="button" className="text-xs font-bold text-[var(--forest)]" onClick={addSize}>
                + Ukuran
              </button>
            </div>
            <div className="space-y-2">
              {sizes.map((size, index) => (
                <div key={index} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold">Ukuran {index + 1}</span>
                    {sizes.length > 1 && (
                      <button
                        type="button"
                        className="text-xs text-[var(--red)]"
                        onClick={() => removeSize(index)}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      className="input col-span-1"
                      placeholder="Label"
                      value={size.label}
                      onChange={(e) => updateSize(index, { label: e.target.value })}
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="ml"
                      value={size.volumeMl ?? ""}
                      onChange={(e) =>
                        updateSize(index, {
                          volumeMl: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Harga"
                      value={size.price || ""}
                      onChange={(e) => updateSize(index, { price: Number(e.target.value) })}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            Tersedia di POS
          </label>

          <label className="block text-xs font-semibold text-[var(--caption)]">
            Deskripsi (opsional)
            <textarea
              className="input mt-1 min-h-[72px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          {error && <p className="text-sm text-[var(--red)]">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambah Menu"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function MenuDashboard() {
  const { branchFilter, setBranchFilter, branches, branchName } = useBranchFilter();
  const { menuItems, loading, error, refresh } = useDashboardData();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Hapus "${item.name}"?`)) return;
    await deleteMenuItem(item.id);
    await refresh();
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
      <div className="menu-toolbar">
        <select
          className="menu-toolbar-select"
          value={branchFilter ?? ""}
          onChange={(e) => setBranchFilter(e.target.value === "" ? null : e.target.value)}
          aria-label="Filter toko"
        >
          <option value="">Semua toko</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <span className="chip shrink-0">{menuItems.length} menu</span>

        <button
          type="button"
          className="btn-primary ml-auto inline-flex shrink-0 items-center gap-1.5 !px-3.5 !py-2 text-xs"
          onClick={() => setCreating(true)}
        >
          <FeatureIcon name="plus" className="h-4 w-4" />
          Tambah
        </button>
      </div>

      {error && <p className="text-sm text-[var(--red)]">{error}</p>}

      {menuItems.length === 0 ? (
        <div className="menu-list">
          <p className="menu-empty">
            {branchFilter
              ? `Belum ada menu untuk ${branchName(branchFilter)}.`
              : "Belum ada menu. Pilih toko atau tambah menu baru."}
          </p>
        </div>
      ) : (
        <div className="menu-list">
          {menuItems.map((item) => {
            const meta = [
              MENU_CATEGORY_LABELS[item.category],
              item.code || null,
              !branchFilter && item.branchId ? branchName(item.branchId) : null,
              `${item.cupSizes.length} ukuran`,
              `Stok ${item.stock}`,
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <div key={item.id} className="menu-row">
                <div className="menu-row-main">
                  <div className="flex items-baseline gap-2">
                    <p className="menu-row-name">{item.name}</p>
                    <span className="menu-row-price-mobile">{menuPriceLabel(item)}</span>
                  </div>
                  <p className="menu-row-meta">{meta}</p>
                </div>

                {!item.isAvailable && (
                  <span className="menu-row-badge chip !bg-red-50 !text-[var(--red)]">Off</span>
                )}

                <p className="menu-row-price">{menuPriceLabel(item)}</p>

                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => setEditing(item)}
                >
                  <FeatureIcon name="edit" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn-danger"
                  aria-label={`Hapus ${item.name}`}
                  onClick={() => handleDelete(item)}
                >
                  <FeatureIcon name="trash" className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {(creating || editing) && (
        <MenuFormModal
          item={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
