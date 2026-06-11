"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FeatureIcon, FeatureIconName } from "@/components/feature-icon";
import { MAIN_NAV } from "@/lib/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-brand">
        <div className="dashboard-sidebar-logo">CB</div>
        <div className="dashboard-sidebar-brand-text">
          <span className="font-bold">Coffee Basala</span>
          <span className="text-[11px] text-white/60">Owner</span>
        </div>
      </div>

      <nav className="dashboard-sidebar-nav" aria-label="Navigasi utama">
        {MAIN_NAV.map((item) => {
          const active = item.match(pathname);
          const showChildren = active && item.children && item.children.length > 0;

          return (
            <div key={item.href} className="dashboard-sidebar-group">
              <Link
                href={item.href}
                className={active ? "dashboard-sidebar-link active" : "dashboard-sidebar-link"}
              >
                <FeatureIcon name={item.icon as FeatureIconName} />
                <span>{item.label}</span>
              </Link>
              {showChildren && (
                <div className="dashboard-sidebar-sub">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={
                        child.match(pathname)
                          ? "dashboard-sidebar-sublink active"
                          : "dashboard-sidebar-sublink"
                      }
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
  );
}
