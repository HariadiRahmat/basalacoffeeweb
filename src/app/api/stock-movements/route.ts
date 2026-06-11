import { NextRequest, NextResponse } from "next/server";
import { listStockMovements } from "@/lib/inventory-api";

export async function GET(request: NextRequest) {
  try {
    const branchId = request.nextUrl.searchParams.get("branch_id");
    if (!branchId) {
      return NextResponse.json({ error: "branch_id wajib" }, { status: 400 });
    }
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 100);
    const items = await listStockMovements(branchId, limit);
    return NextResponse.json({ data: items });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal memuat stock movements" },
      { status: 500 },
    );
  }
}
