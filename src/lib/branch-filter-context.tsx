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
import { fetchBranches } from "@/lib/firestore-data";
import { Branch } from "@/lib/types";

interface BranchFilterContextValue {
  branchFilter: string | null;
  setBranchFilter: (id: string | null) => void;
  branches: Branch[];
  branchesLoading: boolean;
  refreshBranches: () => Promise<void>;
  branchName: (id: string | null | undefined) => string;
}

const BranchFilterContext = createContext<BranchFilterContextValue | null>(null);

export function BranchFilterProvider({ children }: { children: ReactNode }) {
  const [branchFilter, setBranchFilter] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);

  const refreshBranches = useCallback(async () => {
    setBranchesLoading(true);
    try {
      const list = await fetchBranches(true);
      setBranches(list);
      if (branchFilter && !list.some((b) => b.id === branchFilter)) {
        setBranchFilter(null);
      }
    } finally {
      setBranchesLoading(false);
    }
  }, [branchFilter]);

  useEffect(() => {
    refreshBranches();
  }, [refreshBranches]);

  const lookup = useMemo(
    () => new Map(branches.map((b) => [b.id, b.name])),
    [branches],
  );

  const branchName = useCallback(
    (id: string | null | undefined) => {
      if (!id) return "Semua toko";
      return lookup.get(id) ?? id;
    },
    [lookup],
  );

  const value = useMemo(
    () => ({
      branchFilter,
      setBranchFilter,
      branches,
      branchesLoading,
      refreshBranches,
      branchName,
    }),
    [branchFilter, branches, branchesLoading, refreshBranches, branchName],
  );

  return (
    <BranchFilterContext.Provider value={value}>
      {children}
    </BranchFilterContext.Provider>
  );
}

export function useBranchFilter() {
  const ctx = useContext(BranchFilterContext);
  if (!ctx) throw new Error("useBranchFilter must be used within BranchFilterProvider");
  return ctx;
}
