import { NextRequest, NextResponse } from "next/server";
import { recordStockIn } from "@/lib/inventory-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.branch_id || !body.ingredient_id || !body.quantity) {
      return NextResponse.json(
        { error: "branch_id, ingredient_id, quantity wajib" },
        { status: 400 },
      );
    }
    const result = await recordStockIn({
      branch_id: String(body.branch_id),
      supplier: String(body.supplier ?? ""),
      ingredient_id: String(body.ingredient_id),
      quantity: Number(body.quantity),
      unit_price: Number(body.unit_price ?? 0),
      invoice_number: body.invoice_number ? String(body.invoice_number) : undefined,
      received_date: body.received_date ?? new Date().toISOString(),
      created_by: body.created_by ? String(body.created_by) : undefined,
    });
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal mencatat stock in" },
      { status: 500 },
    );
  }
}
