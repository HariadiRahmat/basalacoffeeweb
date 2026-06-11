import { NextRequest, NextResponse } from "next/server";
import { createIngredient, listIngredients } from "@/lib/inventory-api";

export async function GET(request: NextRequest) {
  try {
    const branchId = request.nextUrl.searchParams.get("branch_id");
    if (!branchId) {
      return NextResponse.json({ error: "branch_id wajib" }, { status: 400 });
    }
    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    const items = await listIngredients(branchId, search);
    return NextResponse.json({ data: items });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal memuat ingredients" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.branch_id || !body.name || !body.code) {
      return NextResponse.json({ error: "branch_id, code, name wajib" }, { status: 400 });
    }
    const item = await createIngredient({
      code: String(body.code),
      name: String(body.name),
      category: String(body.category ?? "Umum"),
      unit: body.unit ?? "pcs",
      minimum_stock: Number(body.minimum_stock ?? 0),
      current_stock: Number(body.current_stock ?? 0),
      branch_id: String(body.branch_id),
      description: body.description ? String(body.description) : undefined,
    });
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal menyimpan ingredient" },
      { status: 500 },
    );
  }
}
