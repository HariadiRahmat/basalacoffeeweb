"use client";

import { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopbar } from "@/components/dashboard-topbar";

export function DashboardLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="dashboard-app">
      <DashboardSidebar />
      <div className="dashboard-main">
        <DashboardTopbar title={title} subtitle={subtitle} />
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}

export function PageSection({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`page-section ${className}`}>
      {(title || action) && (
        <div className="page-section-head">
          <div>
            {title && <h2 className="section-heading">{title}</h2>}
            {subtitle && <p className="section-subheading">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function DashboardGrid({
  children,
  cols = 2,
}: {
  children: ReactNode;
  cols?: 1 | 2 | 3;
}) {
  return (
    <div
      className={
        cols === 1
          ? "dashboard-grid dashboard-grid-1"
          : cols === 3
            ? "dashboard-grid dashboard-grid-3"
            : "dashboard-grid dashboard-grid-2"
      }
    >
      {children}
    </div>
  );
}
