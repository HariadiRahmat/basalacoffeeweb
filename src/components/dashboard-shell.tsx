"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { FeatureIcon, FeatureIconName } from "@/components/feature-icon";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MobileNavDrawer } from "@/components/mobile-nav-drawer";
import { useAuth } from "@/lib/auth-context";
import { BranchFilterProvider } from "@/lib/branch-filter-context";
import { DashboardDataProvider } from "@/lib/dashboard-data-context";
import { MobileNavProvider, useMobileNav } from "@/lib/mobile-nav-context";
import { isMobileMoreActive, MOBILE_BOTTOM_PRIMARY } from "@/lib/navigation";
import { useRouter } from "next/navigation";

function MobileNav() {
  const pathname = usePathname();
  const { openDrawer } = useMobileNav();
  const moreActive = isMobileMoreActive(pathname);

  return (
    <nav className="mobile-nav" aria-label="Navigasi mobile">
      {MOBILE_BOTTOM_PRIMARY.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "mobile-nav-item active" : "mobile-nav-item"}
            aria-current={active ? "page" : undefined}
          >
            <FeatureIcon name={item.icon as FeatureIconName} className="h-5 w-5 shrink-0" />
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        className={moreActive ? "mobile-nav-item active" : "mobile-nav-item"}
        aria-label="Menu lainnya"
        aria-expanded={moreActive}
        onClick={openDrawer}
      >
        <FeatureIcon name="more" className="h-5 w-5 shrink-0" />
        <span className="mobile-nav-label">Lainnya</span>
      </button>
    </nav>
  );
}

function DashboardShellInner({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <MobileNavProvider>
      <DashboardLayout title={title} subtitle={subtitle}>
        {children}
      </DashboardLayout>
      <MobileNav />
      <MobileNavDrawer />
    </MobileNavProvider>
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
        <DashboardShellInner title={title} subtitle={subtitle}>
          {children}
        </DashboardShellInner>
      </DashboardDataProvider>
    </BranchFilterProvider>
  );
}
