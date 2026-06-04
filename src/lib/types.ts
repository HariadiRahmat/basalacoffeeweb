export type InsightPeriod = "today" | "week" | "month" | "year";

export type OrderStatus =
  | "new"
  | "processing"
  | "ready"
  | "completed"
  | "cancelled";

export interface OrderLine {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  lines: OrderLine[];
  total: number;
  createdAt: Date;
  updatedAt?: Date;
  branchId?: string;
  paymentMethod?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  isActive: boolean;
  openTime: string;
  closeTime: string;
}

export interface BranchRecap {
  branchId: string;
  branchName: string;
  totalSales: number;
  transactionCount: number;
  cashSales: number;
  qrisSales: number;
  growthPercent?: number;
  sharePercent: number;
  rank: number;
}

export interface NetworkInsight {
  period: InsightPeriod;
  branches: BranchRecap[];
  totalSales: number;
  totalTransactions: number;
}

export interface SalesDataPoint {
  label: string;
  amount: number;
}

export interface TopProduct {
  menuItemId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface BranchLineSeries {
  branchId: string;
  branchName: string;
  color: string;
  values: number[];
}

export interface MultiStoreChartData {
  labels: string[];
  series: BranchLineSeries[];
}

export interface OwnerProfile {
  uid: string;
  fullName: string;
  email: string;
  role: string;
}

export const LEGACY_DEFAULT_BRANCH_ID = "branch-1";

export const PERIOD_LABELS: Record<InsightPeriod, string> = {
  today: "Hari Ini",
  week: "Minggu",
  month: "Bulan",
  year: "Tahun",
};
