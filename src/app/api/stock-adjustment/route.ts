import { NextRequest, NextResponse } from "next/server";
import { recordStockAdjustment } from "@/lib/inventory-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.branch_id || !body.ingredient_id || !body.quantity) {
      return NextResponse.json(
        { error: "branch_id, ingredient_id, quantity wajib" },
        { status: 400 },
      );
    }
    const result = await recordStockAdjustment({
      branch_id: String(body.branch_id),
      ingredient_id: String(body.ingredient_id),
      quantity: Number(body.quantity),
      reason: String(body.reason ?? "Koreksi Stok"),
      notes: body.notes ? String(body.notes) : undefined,
      created_by: body.created_by ? String(body.created_by) : undefined,
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal mencatat adjustment";
    const status = message.includes("tidak mencukupi") ? 422 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
