"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { useAuth } from "@/lib/auth-context";
import { BranchFilterProvider } from "@/lib/branch-filter-context";
import { DashboardDataProvider } from "@/lib/dashboard-data-context";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const allowed = Boolean(user && profile?.role === "owner");

  useEffect(() => {
    if (!loading && !allowed) router.replace("/login");
  }, [allowed, loading, router]);

  if (loading || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--lime)] border-t-transparent" />
      </div>
    );
  }

  return (
    <BranchFilterProvider>
      <DashboardDataProvider>
        <DashboardNav />
        {children}
      </DashboardDataProvider>
    </BranchFilterProvider>
  );
}
