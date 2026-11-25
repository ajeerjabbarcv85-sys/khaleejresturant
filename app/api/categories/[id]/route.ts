import { NextRequest } from "next/server";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db, mapCategory } from "@/lib/db";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Context) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const existing = db
      .prepare("SELECT id FROM food_categories WHERE id = ?")
      .get(Number(id));
    if (!existing) return fail("Category not found", 404);

    db.prepare(
      `UPDATE food_categories
       SET name = ?, slug = ?, description = ?, image = ?, sortOrder = ?, active = ?
       WHERE id = ?`
    ).run(
      String(body.name || "").trim(),
      String(body.slug || "").trim(),
      String(body.description || "").trim(),
      String(body.image || "").trim(),
      Number(body.sortOrder || 0),
      body.active === false ? 0 : 1,
      Number(id)
    );

    const row = db
      .prepare("SELECT * FROM food_categories WHERE id = ?")
      .get(Number(id)) as Record<string, unknown>;
    return ok(mapCategory(row), "Category updated");
  } catch (error) {
    return badRequest(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  const count = (
    db.prepare("SELECT COUNT(*) AS n FROM food_items WHERE categoryId = ?").get(Number(id)) as {
      n: number;
    }
  ).n;
  if (count > 0) return fail("Move or delete the items in this category first", 409);

  db.prepare("DELETE FROM food_categories WHERE id = ?").run(Number(id));
  return ok({ id: Number(id) }, "Category deleted");
}
