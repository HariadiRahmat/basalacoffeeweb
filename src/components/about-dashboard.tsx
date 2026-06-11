"use client";

import { PageSection } from "@/components/dashboard-layout";

export function AboutDashboard() {
  return (
    <div className="dashboard-page">
      <PageSection title="Tentang Aplikasi" subtitle="Coffee Basala Owner Dashboard">
        <div className="card space-y-4">
        <Row label="Brand" value="Coffee Basala" />
        <Row label="Tagline" value="Kopi premium, rasa autentik" />
        <Row label="Backend" value="Firebase Firestore" />
        <Row label="Platform" value="Web Dashboard (Next.js)" />
        <Row label="Versi" value="1.0.0" />
      </div>
    </PageSection>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-[var(--caption)]">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
