"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useBranchFilter } from "@/lib/branch-filter-context";
import {
  fetchCustomerCount,
  fetchMenuItems,
  fetchOrders,
} from "@/lib/firestore-data";
import { MenuItem, Order } from "@/lib/types";

interface DashboardDataContextValue {
  orders: Order[];
  menuItems: MenuItem[];
  customerCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const { branchFilter } = useBranchFilter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [o, m, c] = await Promise.all([
        fetchOrders(branchFilter),
        fetchMenuItems(branchFilter),
        fetchCustomerCount(),
      ]);
      setOrders(o);
      setMenuItems(m);
      setCustomerCount(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [branchFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      orders,
      menuItems,
      customerCount,
      loading,
      error,
      refresh,
    }),
    [orders, menuItems, customerCount, loading, error, refresh],
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) throw new Error("useDashboardData must be used within DashboardDataProvider");
  return ctx;
}
