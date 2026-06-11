import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

export type InventoryUnit = "gram" | "ml" | "liter" | "pcs" | "kg";
export type MovementType = "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT" | "OPNAME";

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: InventoryUnit;
  minimum_stock: number;
  current_stock: number;
  branch_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeItem {
  ingredient_id: string;
  quantity: number;
  ingredient_name?: string;
  unit?: string;
}

export interface Recipe {
  id: string;
  menu_item_id: string;
  branch_id: string;
  name: string;
  items: RecipeItem[];
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: string;
  ingredient_id: string;
  branch_id: string;
  movement_type: MovementType;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

function parseDate(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

function mapIngredient(id: string, data: Record<string, unknown>): Ingredient {
  return {
    id,
    code: String(data.code ?? ""),
    name: String(data.name ?? ""),
    category: String(data.category ?? "Umum"),
    unit: (data.unit as InventoryUnit) ?? "pcs",
    minimum_stock: Number(data.minimum_stock ?? 0),
    current_stock: Number(data.current_stock ?? 0),
    branch_id: String(data.branch_id ?? ""),
    description: data.description ? String(data.description) : undefined,
    created_at: parseDate(data.created_at),
    updated_at: parseDate(data.updated_at),
  };
}

export async function listIngredients(branchId: string, search?: string): Promise<Ingredient[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, "ingredients"), where("branch_id", "==", branchId));
  const snap = await getDocs(q);
  let items = snap.docs.map((d) => mapIngredient(d.id, d.data() as Record<string, unknown>));
  items.sort((a, b) => a.name.localeCompare(b.name));
  if (search?.trim()) {
    const s = search.trim().toLowerCase();
    items = items.filter(
      (i) => i.name.toLowerCase().includes(s) || i.code.toLowerCase().includes(s),
    );
  }
  return items;
}

export async function createIngredient(
  body: Omit<Ingredient, "id" | "created_at" | "updated_at">,
): Promise<Ingredient> {
  const db = getFirestoreDb();
  const now = new Date().toISOString();
  const ref = doc(collection(db, "ingredients"));
  const payload = { ...body, created_at: now, updated_at: now };
  await setDoc(ref, payload);
  return mapIngredient(ref.id, payload);
}

export async function listRecipes(branchId: string): Promise<Recipe[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, "recipes"), where("branch_id", "==", branchId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      menu_item_id: String(data.menu_item_id ?? ""),
      branch_id: String(data.branch_id ?? ""),
      name: String(data.name ?? ""),
      items: (data.items as RecipeItem[]) ?? [],
      created_at: parseDate(data.created_at),
      updated_at: parseDate(data.updated_at),
    };
  });
}

export async function createRecipe(
  body: Omit<Recipe, "id" | "created_at" | "updated_at">,
): Promise<Recipe> {
  const db = getFirestoreDb();
  const now = new Date().toISOString();
  const ref = doc(collection(db, "recipes"));
  const payload = { ...body, created_at: now, updated_at: now };
  await setDoc(ref, payload);
  return { id: ref.id, ...payload };
}

export async function listStockMovements(
  branchId: string,
  limit = 100,
): Promise<StockMovement[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, "stock_movements"), where("branch_id", "==", branchId));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      ingredient_id: String(data.ingredient_id ?? ""),
      branch_id: String(data.branch_id ?? ""),
      movement_type: (data.movement_type as MovementType) ?? "ADJUSTMENT",
      quantity: Number(data.quantity ?? 0),
      stock_before: Number(data.stock_before ?? 0),
      stock_after: Number(data.stock_after ?? 0),
      reference_type: data.reference_type ? String(data.reference_type) : undefined,
      reference_id: data.reference_id ? String(data.reference_id) : undefined,
      notes: data.notes ? String(data.notes) : undefined,
      created_by: data.created_by ? String(data.created_by) : undefined,
      created_at: parseDate(data.created_at),
    };
  });
  items.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return items.slice(0, limit);
}

async function writeMovement(
  tx: Parameters<Parameters<typeof runTransaction>[1]>[0],
  db: ReturnType<typeof getFirestoreDb>,
  params: Omit<StockMovement, "id" | "created_at">,
) {
  const ref = doc(collection(db, "stock_movements"));
  tx.set(ref, {
    ...params,
    created_at: serverTimestamp(),
  });
}

export async function recordStockIn(body: {
  branch_id: string;
  supplier: string;
  ingredient_id: string;
  quantity: number;
  unit_price: number;
  invoice_number?: string;
  received_date: string;
  created_by?: string;
}) {
  const db = getFirestoreDb();
  const stockInRef = doc(collection(db, "stock_ins"));
  const totalPrice = body.quantity * body.unit_price;

  await runTransaction(db, async (tx) => {
    const ingRef = doc(db, "ingredients", body.ingredient_id);
    const ingSnap = await tx.get(ingRef);
    if (!ingSnap.exists()) throw new Error("Bahan baku tidak ditemukan");
    const before = Number(ingSnap.data()?.current_stock ?? 0);
    const after = before + body.quantity;
    tx.update(ingRef, { current_stock: after, updated_at: new Date().toISOString() });
    await writeMovement(tx, db, {
      ingredient_id: body.ingredient_id,
      branch_id: body.branch_id,
      movement_type: "IN",
      quantity: body.quantity,
      stock_before: before,
      stock_after: after,
      reference_type: "stock_in",
      reference_id: stockInRef.id,
      notes: `Penerimaan dari ${body.supplier}`,
      created_by: body.created_by,
    });
    tx.set(stockInRef, {
      branch_id: body.branch_id,
      supplier: body.supplier,
      ingredient_id: body.ingredient_id,
      quantity: body.quantity,
      unit_price: body.unit_price,
      total_price: totalPrice,
      invoice_number: body.invoice_number ?? null,
      received_date: body.received_date,
      created_by: body.created_by ?? null,
      created_at: serverTimestamp(),
    });
  });

  return { id: stockInRef.id, total_price: totalPrice };
}

export async function recordStockAdjustment(body: {
  branch_id: string;
  ingredient_id: string;
  quantity: number;
  reason: string;
  notes?: string;
  created_by?: string;
}) {
  const db = getFirestoreDb();
  const adjRef = doc(collection(db, "stock_adjustments"));

  await runTransaction(db, async (tx) => {
    const ingRef = doc(db, "ingredients", body.ingredient_id);
    const ingSnap = await tx.get(ingRef);
    if (!ingSnap.exists()) throw new Error("Bahan baku tidak ditemukan");
    const before = Number(ingSnap.data()?.current_stock ?? 0);
    if (before < body.quantity) throw new Error("Stok bahan baku tidak mencukupi");
    const after = before - body.quantity;
    tx.update(ingRef, { current_stock: after, updated_at: new Date().toISOString() });
    await writeMovement(tx, db, {
      ingredient_id: body.ingredient_id,
      branch_id: body.branch_id,
      movement_type: "ADJUSTMENT",
      quantity: body.quantity,
      stock_before: before,
      stock_after: after,
      reference_type: "stock_adjustment",
      reference_id: adjRef.id,
      notes: body.notes ?? body.reason,
      created_by: body.created_by,
    });
    tx.set(adjRef, {
      branch_id: body.branch_id,
      ingredient_id: body.ingredient_id,
      quantity: body.quantity,
      reason: body.reason,
      notes: body.notes ?? null,
      created_by: body.created_by ?? null,
      created_at: serverTimestamp(),
    });
  });

  return { id: adjRef.id };
}

export async function recordStockOpname(body: {
  branch_id: string;
  ingredient_id: string;
  physical_stock: number;
  notes?: string;
  approved_by?: string;
}) {
  const db = getFirestoreDb();
  const opnameRef = doc(collection(db, "stock_opnames"));

  await runTransaction(db, async (tx) => {
    const ingRef = doc(db, "ingredients", body.ingredient_id);
    const ingSnap = await tx.get(ingRef);
    if (!ingSnap.exists()) throw new Error("Bahan baku tidak ditemukan");
    const systemStock = Number(ingSnap.data()?.current_stock ?? 0);
    const difference = body.physical_stock - systemStock;

    tx.update(ingRef, {
      current_stock: body.physical_stock,
      updated_at: new Date().toISOString(),
    });

    if (difference !== 0) {
      await writeMovement(tx, db, {
        ingredient_id: body.ingredient_id,
        branch_id: body.branch_id,
        movement_type: "OPNAME",
        quantity: Math.abs(difference),
        stock_before: systemStock,
        stock_after: body.physical_stock,
        reference_type: "stock_opname",
        reference_id: opnameRef.id,
        notes: body.notes ?? `Selisih opname ${difference}`,
        created_by: body.approved_by,
      });
    }

    tx.set(opnameRef, {
      branch_id: body.branch_id,
      ingredient_id: body.ingredient_id,
      system_stock: systemStock,
      physical_stock: body.physical_stock,
      difference,
      notes: body.notes ?? null,
      status: "approved",
      approved_by: body.approved_by ?? null,
      created_at: serverTimestamp(),
    });
  });

  return { id: opnameRef.id };
}
