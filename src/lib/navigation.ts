export type NavItem = {
  href: string;
  label: string;
  icon: string;
  match: (path: string) => boolean;
  children?: { href: string; label: string; match: (path: string) => boolean }[];
};

export const MAIN_NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Home",
    icon: "home",
    match: (p) => p === "/dashboard",
  },
  {
    href: "/dashboard/transactions",
    label: "Transaksi",
    icon: "wallet",
    match: (p) => p.startsWith("/dashboard/transactions") || p.startsWith("/dashboard/orders"),
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: "analytics",
    match: (p) => p.startsWith("/dashboard/analytics"),
  },
  {
    href: "/dashboard/reports",
    label: "Laporan",
    icon: "file-report",
    match: (p) => p.startsWith("/dashboard/reports"),
  },
  {
    href: "/dashboard/menu",
    label: "Menu",
    icon: "menu",
    match: (p) => p.startsWith("/dashboard/menu"),
  },
  {
    href: "/dashboard/customers",
    label: "Pelanggan",
    icon: "customers",
    match: (p) => p.startsWith("/dashboard/customers"),
  },
  {
    href: "/dashboard/loyalty",
    label: "Loyalty",
    icon: "loyalty",
    match: (p) => p.startsWith("/dashboard/loyalty"),
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: "inventory",
    match: (p) => p.startsWith("/dashboard/inventory"),
    children: [
      {
        href: "/dashboard/inventory",
        label: "Ringkasan",
        match: (p) => p === "/dashboard/inventory",
      },
      {
        href: "/dashboard/inventory/ingredients",
        label: "Bahan Baku",
        match: (p) => p.startsWith("/dashboard/inventory/ingredients"),
      },
      {
        href: "/dashboard/inventory/recipes",
        label: "Resep",
        match: (p) => p.startsWith("/dashboard/inventory/recipes"),
      },
      {
        href: "/dashboard/inventory/stock-in",
        label: "Penerimaan",
        match: (p) => p.startsWith("/dashboard/inventory/stock-in"),
      },
      {
        href: "/dashboard/inventory/adjustment",
        label: "Penyesuaian",
        match: (p) => p.startsWith("/dashboard/inventory/adjustment"),
      },
      {
        href: "/dashboard/inventory/opname",
        label: "Opname",
        match: (p) => p.startsWith("/dashboard/inventory/opname"),
      },
      {
        href: "/dashboard/inventory/movements",
        label: "Riwayat",
        match: (p) => p.startsWith("/dashboard/inventory/movements"),
      },
    ],
  },
  {
    href: "/dashboard/settings/admins",
    label: "Admin & Toko",
    icon: "store",
    match: (p) => p.startsWith("/dashboard/settings/admins"),
  },
  {
    href: "/dashboard/settings",
    label: "Pengaturan",
    icon: "settings",
    match: (p) =>
      p.startsWith("/dashboard/settings") && !p.startsWith("/dashboard/settings/admins"),
    children: [
      {
        href: "/dashboard/settings",
        label: "Umum",
        match: (p) => p === "/dashboard/settings",
      },
      {
        href: "/dashboard/settings/about",
        label: "Tentang",
        match: (p) => p.startsWith("/dashboard/settings/about"),
      },
    ],
  },
];

export const MOBILE_BOTTOM_PRIMARY = [
  MAIN_NAV[0],
  MAIN_NAV[1],
  MAIN_NAV[2],
  MAIN_NAV[4],
] as const;

export function isMobileMoreActive(pathname: string): boolean {
  return MAIN_NAV.some((item) => {
    if (MOBILE_BOTTOM_PRIMARY.some((primary) => primary.href === item.href)) return false;
    return item.match(pathname);
  });
}
