"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { FeatureIcon, FeatureIconName } from "@/components/feature-icon";
import { useMobileNav } from "@/lib/mobile-nav-context";
import { MAIN_NAV } from "@/lib/navigation";

export function MobileNavDrawer() {
  const pathname = usePathname();
  const { drawerOpen, closeDrawer } = useMobileNav();

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="mobile-drawer-root lg:hidden" role="dialog" aria-modal="true" aria-label="Menu navigasi">
      <button type="button" className="mobile-drawer-backdrop" aria-label="Tutup menu" onClick={closeDrawer} />
      <aside id="mobile-nav-drawer" className="mobile-drawer">
        <div className="mobile-drawer-head">
          <div>
            <p className="text-sm font-bold text-[var(--ink)]">Navigasi</p>
            <p className="text-xs text-[var(--caption)]">Semua halaman dashboard</p>
          </div>
          <button type="button" className="icon-btn" aria-label="Tutup" onClick={closeDrawer}>
            <FeatureIcon name="close" className="h-4 w-4" />
          </button>
        </div>

        <nav className="mobile-drawer-nav" aria-label="Semua menu">
          {MAIN_NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <div key={item.href} className="mobile-drawer-group">
                <Link
                  href={item.href}
                  className={active ? "mobile-drawer-link active" : "mobile-drawer-link"}
                  onClick={closeDrawer}
                >
                  <FeatureIcon name={item.icon as FeatureIconName} className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
                {item.children && item.children.length > 0 && (
                  <div className="mobile-drawer-sub">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={
                          child.match(pathname)
                            ? "mobile-drawer-sublink active"
                            : "mobile-drawer-sublink"
                        }
                        onClick={closeDrawer}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
