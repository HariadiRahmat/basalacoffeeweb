import { NextRequest, NextResponse } from "next/server";
import { recordStockOpname } from "@/lib/inventory-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.branch_id || !body.ingredient_id || body.physical_stock == null) {
      return NextResponse.json(
        { error: "branch_id, ingredient_id, physical_stock wajib" },
        { status: 400 },
      );
    }
    const result = await recordStockOpname({
      branch_id: String(body.branch_id),
      ingredient_id: String(body.ingredient_id),
      physical_stock: Number(body.physical_stock),
      notes: body.notes ? String(body.notes) : undefined,
      approved_by: body.approved_by ? String(body.approved_by) : undefined,
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal mencatat opname" },
      { status: 500 },
    );
  }
}
