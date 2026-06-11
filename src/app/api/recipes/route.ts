import { NextRequest, NextResponse } from "next/server";
import { createRecipe, listRecipes } from "@/lib/inventory-api";

export async function GET(request: NextRequest) {
  try {
    const branchId = request.nextUrl.searchParams.get("branch_id");
    if (!branchId) {
      return NextResponse.json({ error: "branch_id wajib" }, { status: 400 });
    }
    const items = await listRecipes(branchId);
    return NextResponse.json({ data: items });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal memuat recipes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.branch_id || !body.menu_item_id || !body.name) {
      return NextResponse.json(
        { error: "branch_id, menu_item_id, name wajib" },
        { status: 400 },
      );
    }
    const item = await createRecipe({
      menu_item_id: String(body.menu_item_id),
      branch_id: String(body.branch_id),
      name: String(body.name),
      items: body.items ?? [],
    });
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal menyimpan recipe" },
      { status: 500 },
    );
  }
}
