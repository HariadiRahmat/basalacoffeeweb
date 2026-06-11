"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { FeatureIcon } from "@/components/feature-icon";
import { PageSection } from "@/components/dashboard-layout";
import { useBranchFilter } from "@/lib/branch-filter-context";
import {
  createIngredient,
  listIngredients,
  listRecipes,
  listStockMovements,
  recordStockAdjustment,
  recordStockIn,
  type Ingredient,
  type Recipe,
  type StockMovement,
} from "@/lib/inventory-api";
import { useDashboardData } from "@/lib/dashboard-data-context";

function InventoryBranchHint() {
  const { branchFilter, branchName } = useBranchFilter();
  if (branchFilter) {
    return (
      <div className="menu-toolbar">
        <FeatureIcon name="store" className="h-4 w-4 shrink-0 text-[var(--forest)]" />
        <span className="text-sm font-semibold text-[var(--ink)]">{branchName(branchFilter)}</span>
        <span className="chip shrink-0">Outlet aktif</span>
      </div>
    );
  }
  return (
    <div className="inventory-hint">
      <FeatureIcon name="store" className="h-4 w-4 shrink-0" />
      <p>Pilih outlet di toolbar atas untuk mengelola inventory.</p>
    </div>
  );
}

function BranchGate({ children }: { children: (branchId: string) => ReactNode }) {
  const { branchFilter } = useBranchFilter();
  return (
    <div className="dashboard-page">
      <InventoryBranchHint />
      {!branchFilter ? null : children(branchFilter)}
    </div>
  );
}

export function InventoryIngredientsPage() {
  const { branchFilter } = useBranchFilter();
  const [items, setItems] = useState<Ingredient[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Umum");
  const [unit, setUnit] = useState<Ingredient["unit"]>("pcs");
  const [minimum, setMinimum] = useState(0);

  useEffect(() => {
    if (!branchFilter) {
      setItems([]);
      return;
    }
    listIngredients(branchFilter).then(setItems).catch(() => setItems([]));
  }, [branchFilter]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!branchFilter) return;
    await createIngredient({
      code,
      name,
      category,
      unit,
      minimum_stock: minimum,
      current_stock: 0,
      branch_id: branchFilter,
    });
    setCode("");
    setName("");
    setItems(await listIngredients(branchFilter));
  };

  return (
    <BranchGate>
      {() => (
        <PageSection title="Master Bahan Baku">
          <form onSubmit={onCreate} className="card grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Kode" value={code} onChange={(e) => setCode(e.target.value)} required />
            <input className="input" placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="input" placeholder="Kategori" value={category} onChange={(e) => setCategory(e.target.value)} />
            <select className="input" value={unit} onChange={(e) => setUnit(e.target.value as Ingredient["unit"])}>
              {["pcs", "gram", "kg", "ml", "liter"].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <input
              className="input"
              type="number"
              placeholder="Stok minimum"
              value={minimum}
              onChange={(e) => setMinimum(Number(e.target.value))}
            />
            <button type="submit" className="btn-primary sm:col-span-2">
              + Tambah Bahan
            </button>
          </form>
          <div className="data-table mt-4">
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Stok</th>
                  <th>Min</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.code}</td>
                    <td>{i.name}</td>
                    <td>
                      {i.current_stock} {i.unit}
                    </td>
                    <td>{i.minimum_stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageSection>
      )}
    </BranchGate>
  );
}

export function InventoryRecipesPage() {
  const { menuItems } = useDashboardData();
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  return (
    <BranchGate>
      {(branchId) => <InventoryRecipesInner branchId={branchId} recipes={recipes} setRecipes={setRecipes} menuCount={menuItems.filter((m) => m.branchId === branchId || !m.branchId).length} />}
    </BranchGate>
  );
}

function InventoryRecipesInner({
  branchId,
  recipes,
  setRecipes,
  menuCount,
}: {
  branchId: string;
  recipes: Recipe[];
  setRecipes: (r: Recipe[]) => void;
  menuCount: number;
}) {
  useEffect(() => {
    listRecipes(branchId).then(setRecipes).catch(() => setRecipes([]));
  }, [branchId, setRecipes]);

  return (
    <PageSection title="Resep Menu" subtitle={`${recipes.length} resep · ${menuCount} menu di toko`}>
      {recipes.length === 0 ? (
        <div className="card card-empty text-sm text-[var(--caption)]">
          Belum ada resep. Buat resep melalui aplikasi mobile atau tambahkan via API.
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((r) => (
            <div key={r.id} className="card card-compact">
              <p className="font-semibold">{r.name}</p>
              <p className="text-xs text-[var(--caption)]">{r.items.length} bahan</p>
            </div>
          ))}
        </div>
      )}
    </PageSection>
  );
}

export function InventoryStockInPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [supplier, setSupplier] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <BranchGate>
      {(branchId) => (
        <StockInInner
          branchId={branchId}
          ingredients={ingredients}
          setIngredients={setIngredients}
          ingredientId={ingredientId}
          setIngredientId={setIngredientId}
          quantity={quantity}
          setQuantity={setQuantity}
          supplier={supplier}
          setSupplier={setSupplier}
          unitPrice={unitPrice}
          setUnitPrice={setUnitPrice}
          message={message}
          setMessage={setMessage}
        />
      )}
    </BranchGate>
  );
}

function StockInInner(props: {
  branchId: string;
  ingredients: Ingredient[];
  setIngredients: (v: Ingredient[]) => void;
  ingredientId: string;
  setIngredientId: (v: string) => void;
  quantity: number;
  setQuantity: (v: number) => void;
  supplier: string;
  setSupplier: (v: string) => void;
  unitPrice: number;
  setUnitPrice: (v: number) => void;
  message: string | null;
  setMessage: (v: string | null) => void;
}) {
  useEffect(() => {
    listIngredients(props.branchId).then(props.setIngredients);
  }, [props.branchId, props.setIngredients]);

  return (
    <PageSection title="Penerimaan Barang">
      <form
        className="card grid gap-3 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await recordStockIn({
            branch_id: props.branchId,
            supplier: props.supplier,
            ingredient_id: props.ingredientId,
            quantity: props.quantity,
            unit_price: props.unitPrice,
            received_date: new Date().toISOString(),
          });
          props.setMessage("Penerimaan barang berhasil dicatat.");
          listIngredients(props.branchId).then(props.setIngredients);
        }}
      >
        <select
          className="input sm:col-span-2"
          value={props.ingredientId}
          onChange={(e) => props.setIngredientId(e.target.value)}
          required
        >
          <option value="">Pilih bahan</option>
          {props.ingredients.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <input className="input" placeholder="Supplier" value={props.supplier} onChange={(e) => props.setSupplier(e.target.value)} required />
        <input className="input" type="number" placeholder="Qty" value={props.quantity} onChange={(e) => props.setQuantity(Number(e.target.value))} required />
        <input className="input" type="number" placeholder="Harga satuan" value={props.unitPrice} onChange={(e) => props.setUnitPrice(Number(e.target.value))} />
        <button type="submit" className="btn-primary sm:col-span-2">
          Catat Penerimaan
        </button>
      </form>
      {props.message && <p className="mt-3 text-sm text-[var(--forest)]">{props.message}</p>}
    </PageSection>
  );
}

export function InventoryAdjustmentPage() {
  return (
    <BranchGate>
      {(branchId) => <AdjustmentInner branchId={branchId} />}
    </BranchGate>
  );
}

function AdjustmentInner({ branchId }: { branchId: string }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientId, setIngredientId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    listIngredients(branchId).then(setIngredients);
  }, [branchId]);

  return (
    <PageSection title="Penyesuaian Stok">
      <form
        className="card grid gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await recordStockAdjustment({
            branch_id: branchId,
            ingredient_id: ingredientId,
            quantity,
            reason,
          });
          setMessage("Penyesuaian stok berhasil.");
        }}
      >
        <select className="input" value={ingredientId} onChange={(e) => setIngredientId(e.target.value)} required>
          <option value="">Pilih bahan</option>
          {ingredients.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <input className="input" type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        <input className="input" placeholder="Alasan" value={reason} onChange={(e) => setReason(e.target.value)} required />
        <button type="submit" className="btn-primary">
          Simpan Penyesuaian
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-[var(--forest)]">{message}</p>}
    </PageSection>
  );
}

export function InventoryMovementsPage() {
  return (
    <BranchGate>
      {(branchId) => <MovementsInner branchId={branchId} />}
    </BranchGate>
  );
}

function MovementsInner({ branchId }: { branchId: string }) {
  const [movements, setMovements] = useState<StockMovement[]>([]);

  useEffect(() => {
    listStockMovements(branchId).then(setMovements).catch(() => setMovements([]));
  }, [branchId]);

  return (
    <PageSection title="Riwayat Pergerakan Stok">
      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Tipe</th>
              <th>Qty</th>
              <th>Sebelum → Sesudah</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td>{m.movement_type}</td>
                <td>{m.quantity}</td>
                <td>
                  {m.stock_before} → {m.stock_after}
                </td>
                <td>{m.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageSection>
  );
}

export function InventoryOpnamePage() {
  return (
    <BranchGate>
      {() => (
        <PageSection title="Stock Opname">
          <div className="card card-empty text-sm text-[var(--caption)]">
            Fitur opname lengkap tersedia di aplikasi mobile. Web dashboard mendukung penerimaan,
            penyesuaian, dan riwayat pergerakan stok.
          </div>
        </PageSection>
      )}
    </BranchGate>
  );
}
