import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { filterByBranchScope } from "@/lib/branch-scope";
import { getFirestoreDb } from "@/lib/firebase";
import {
  Branch,
  MenuCategory,
  MenuCupSize,
  MenuItem,
  Order,
  OrderLine,
  OrderStatus,
  OwnerProfile,
} from "@/lib/types";

function parseDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "string") return new Date(value);
  if (value instanceof Date) return value;
  return new Date();
}

function mapOrder(id: string, data: Record<string, unknown>): Order {
  const linesRaw = (data.order_lines as Record<string, unknown>[]) ?? [];
  const lines: OrderLine[] = linesRaw.map((line) => {
    const qty = Number(line.quantity ?? 0);
    const unitPrice = Number(line.unit_price ?? 0);
    return {
      menuItemId: String(line.menu_item_id ?? ""),
      name: String(line.name ?? ""),
      quantity: qty,
      unitPrice,
      subtotal: qty * unitPrice,
    };
  });

  return {
    id,
    orderNumber: String(data.order_number ?? id),
    status: (data.status as OrderStatus) ?? "new",
    lines,
    total: Number(data.total ?? 0),
    createdAt: parseDate(data.created_at),
    updatedAt: data.updated_at ? parseDate(data.updated_at) : undefined,
    branchId: data.branch_id ? String(data.branch_id) : undefined,
    paymentMethod: data.payment_method
      ? String(data.payment_method)
      : undefined,
  };
}

function mapBranch(id: string, data: Record<string, unknown>): Branch {
  return {
    id,
    name: String(data.name ?? ""),
    address: String(data.address ?? ""),
    phone: data.phone ? String(data.phone) : undefined,
    isActive:
      (data.is_active as boolean | undefined) ??
      (data.active as boolean | undefined) ??
      true,
    openTime: String(data.open_time ?? "08:00"),
    closeTime: String(data.close_time ?? "22:00"),
  };
}

function mapCupSize(raw: Record<string, unknown>): MenuCupSize {
  return {
    id: String(raw.id ?? raw.label ?? "standar"),
    label: String(raw.label ?? "Standar"),
    price: Number(raw.price ?? 0),
    volumeMl: raw.volume_ml != null ? Number(raw.volume_ml) : undefined,
  };
}

function mapMenuItem(id: string, data: Record<string, unknown>): MenuItem {
  const cupRaw = (data.cup_sizes as Record<string, unknown>[]) ?? [];
  const cupSizes = cupRaw.length > 0 ? cupRaw.map(mapCupSize) : [];
  const price = Number(data.price ?? 0);
  return {
    id,
    name: String(data.name ?? ""),
    price,
    category: (data.category as MenuCategory) ?? "coffee",
    code: data.code ? String(data.code) : undefined,
    description: data.description ? String(data.description) : undefined,
    isAvailable: (data.is_available as boolean | undefined) ?? true,
    stock: Number(data.stock ?? 0),
    branchId: data.branch_id ? String(data.branch_id) : undefined,
    cupSizes:
      cupSizes.length > 0
        ? cupSizes
        : [{ id: "standar", label: "Standar", price }],
  };
}

function menuToFirestore(item: MenuItem): Record<string, unknown> {
  const sizes =
    item.cupSizes.length > 0
      ? item.cupSizes
      : [{ id: "standar", label: "Standar", price: item.price }];
  const listPrice = Math.min(...sizes.map((s) => s.price));
  const branchId = item.branchId?.trim();
  if (!branchId) {
    throw new Error("Menu harus ditetapkan ke toko (branch_id).");
  }
  return {
    name: item.name,
    price: listPrice,
    category: item.category,
    code: item.code ?? null,
    description: item.description ?? null,
    is_available: item.isAvailable,
    stock: item.stock,
    branch_id: branchId,
    cup_sizes: sizes.map((s) => ({
      id: s.id,
      label: s.label,
      price: s.price,
      ...(s.volumeMl != null ? { volume_ml: s.volumeMl } : {}),
    })),
  };
}

export async function fetchOwnerProfile(uid: string): Promise<OwnerProfile | null> {
  const snap = await getDoc(doc(getFirestoreDb(), "profile", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid,
    fullName: String(data.full_name ?? ""),
    email: String(data.email ?? ""),
    role: String(data.role ?? ""),
  };
}

export async function fetchBranches(activeOnly = true): Promise<Branch[]> {
  const snap = await getDocs(
    query(collection(getFirestoreDb(), "branches"), orderBy("name")),
  );
  let branches = snap.docs.map((d) => mapBranch(d.id, d.data()));
  if (activeOnly) branches = branches.filter((b) => b.isActive);
  return branches;
}

export async function fetchOrders(branchId?: string | null): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(getFirestoreDb(), "orders"), orderBy("created_at", "desc")),
  );
  const orders = snap.docs.map((d) => mapOrder(d.id, d.data()));
  return filterByBranchScope(orders, branchId ?? null, (o) => o.branchId);
}

export async function fetchMenuItems(branchId?: string | null): Promise<MenuItem[]> {
  const snap = await getDocs(
    query(collection(getFirestoreDb(), "menu_items"), orderBy("name")),
  );
  const items = snap.docs.map((d) => mapMenuItem(d.id, d.data()));
  return filterByBranchScope(items, branchId ?? null, (m) => m.branchId);
}

export async function upsertMenuItem(item: MenuItem): Promise<MenuItem> {
  const db = getFirestoreDb();
  const id = item.id || doc(collection(db, "menu_items")).id;
  const payload = menuToFirestore({ ...item, id });
  await setDoc(doc(db, "menu_items", id), payload, { merge: true });
  const saved = await getDoc(doc(db, "menu_items", id));
  return mapMenuItem(id, saved.data() as Record<string, unknown>);
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(getFirestoreDb(), "menu_items", id));
}

export async function fetchCustomerCount(): Promise<number> {
  const snap = await getDocs(collection(getFirestoreDb(), "customers"));
  return snap.size;
}

export function effectiveCupSizes(item: MenuItem): MenuCupSize[] {
  if (item.cupSizes.length > 0) return item.cupSizes;
  return [{ id: "standar", label: "Standar", price: item.price }];
}

export function menuPriceLabel(item: MenuItem): string {
  const sizes = effectiveCupSizes(item);
  const min = Math.min(...sizes.map((s) => s.price));
  return sizes.length > 1 ? `dari ${formatIdrInline(min)}` : formatIdrInline(item.price);
}

function formatIdrInline(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function defaultCupSizesForCategory(category: MenuCategory): MenuCupSize[] {
  if (category === "coffee" || category === "non_coffee" || category === "tea") {
    return [
      { id: "kecil", label: "Kecil", price: 0, volumeMl: 240 },
      { id: "sedang", label: "Sedang", price: 0, volumeMl: 350 },
      { id: "besar", label: "Besar", price: 0, volumeMl: 480 },
    ];
  }
  return [{ id: "standar", label: "Standar", price: 0 }];
}
