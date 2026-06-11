"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { PageSection } from "@/components/dashboard-layout";
import { FeatureIcon, FeatureIconName } from "@/components/feature-icon";

const LINKS: {
  href: string;
  title: string;
  subtitle: string;
  icon: FeatureIconName;
}[] = [
  {
    href: "/dashboard/customers",
    title: "Pelanggan",
    subtitle: "Daftar pelanggan dan riwayat transaksi",
    icon: "customers",
  },
  {
    href: "/dashboard/loyalty",
    title: "Program Loyalty",
    subtitle: "Poin, reward, dan bonus member",
    icon: "loyalty",
  },
  {
    href: "/dashboard/inventory",
    title: "Inventory",
    subtitle: "Stok bahan, resep, dan opname",
    icon: "inventory",
  },
  {
    href: "/dashboard/settings/admins",
    title: "Kelola Admin & Toko",
    subtitle: "Kelola admin POS dan data toko/cabang",
    icon: "store",
  },
  {
    href: "/dashboard/settings/about",
    title: "Tentang Aplikasi",
    subtitle: "Brand, backend, dan versi aplikasi",
    icon: "info",
  },
];

export function SettingsDashboard() {
  const { profile } = useAuth();
  const ownerName = profile?.fullName ?? "Owner";
  const initial = ownerName.charAt(0).toUpperCase();

  return (
    <div className="dashboard-page">
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--lime-track)] text-xl font-bold text-[var(--forest)]">
            {initial}
          </div>
          <div>
            <p className="text-lg font-bold">{ownerName}</p>
            <p className="text-sm text-[var(--caption)]">{profile?.email ?? "—"}</p>
            <span className="chip mt-2">Owner</span>
          </div>
        </div>
      </div>

      <PageSection title="Fitur" subtitle="Akses cepat ke modul operasional">
        <div className="grid gap-3 sm:grid-cols-2">
          {LINKS.slice(0, 3).map((item) => (
            <Link key={item.href} href={item.href} className="menu-tile">
              <div className="menu-tile-icon">
                <FeatureIcon name={item.icon} />
              </div>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-[var(--caption)]">{item.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </PageSection>

      <PageSection title="Akun & Aplikasi">
        <div className="grid gap-3 sm:grid-cols-2">
          {LINKS.slice(3).map((item) => (
            <Link key={item.href} href={item.href} className="menu-tile">
              <div className="menu-tile-icon">
                <FeatureIcon name={item.icon} />
              </div>
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-xs text-[var(--caption)]">{item.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
