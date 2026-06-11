"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MAIN_NAV } from "@/lib/navigation";
import { useAuth } from "@/lib/auth-context";
import { BranchFilterProvider } from "@/lib/branch-filter-context";
import { DashboardDataProvider } from "@/lib/dashboard-data-context";
import { useRouter } from "next/navigation";

function MobileNav() {
  const pathname = usePathname();
  const items = MAIN_NAV.filter((n) =>
    ["home", "wallet", "analytics", "menu", "settings"].includes(n.icon),
  );

  return (
    <nav className="mobile-nav" aria-label="Navigasi mobile">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={item.match(pathname) ? "mobile-nav-link active" : "mobile-nav-link"}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function DashboardShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
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
        <DashboardLayout title={title} subtitle={subtitle}>
          {children}
        </DashboardLayout>
        <MobileNav />
      </DashboardDataProvider>
    </BranchFilterProvider>
  );
}
