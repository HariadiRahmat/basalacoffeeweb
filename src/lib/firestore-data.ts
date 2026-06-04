import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { Branch, Order, OrderLine, OrderStatus, OwnerProfile } from "@/lib/types";

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

export async function fetchOrders(): Promise<Order[]> {
  const snap = await getDocs(
    query(collection(getFirestoreDb(), "orders"), orderBy("created_at", "desc")),
  );
  return snap.docs.map((d) => mapOrder(d.id, d.data()));
}

export async function fetchCustomerCount(): Promise<number> {
  const snap = await getDocs(collection(getFirestoreDb(), "customers"));
  return snap.size;
}
