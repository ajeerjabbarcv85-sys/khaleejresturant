import { NextRequest } from "next/server";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db, mapItem } from "@/lib/db";
import { saveDataUrl } from "@/lib/upload";
import type { FoodItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const SELECT = `
  SELECT i.*, c.name AS categoryName
  FROM food_items i
  JOIN food_categories c ON c.id = i.categoryId
`;

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  const { id } = await params;
  const row = db.prepare(`${SELECT} WHERE i.id = ?`).get(Number(id)) as
    | Record<string, unknown>
    | undefined;
  if (!row) return fail("Item not found", 404);
  return ok(mapItem(row));
}

export async function PUT(request: NextRequest, { params }: Context) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  try {
    const body = (await request.json()) as Partial<FoodItem> & { imageData?: string };
    const existing = db.prepare("SELECT * FROM food_items WHERE id = ?").get(Number(id)) as
      | Record<string, unknown>
      | undefined;
    if (!existing) return fail("Item not found", 404);

    const name = String(body.name || existing.name).trim();
    const price = Number(body.price ?? existing.price);
    const stock = Number(body.stock ?? existing.stock);
    const categoryId = Number(body.categoryId ?? existing.categoryId);
    if (!name || !Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0)
      return fail("Enter valid item details");
    if (!db.prepare("SELECT id FROM food_categories WHERE id = ?").get(categoryId))
      return fail("Choose a valid category");

    let imageUrl = String(body.imageUrl ?? existing.imageUrl ?? "").trim();
    if (body.imageData) {
      const saved = saveDataUrl(body.imageData);
      if (saved) imageUrl = saved;
    }

    db.prepare(
      `UPDATE food_items
       SET categoryId = ?, name = ?, description = ?, price = ?, stock = ?, imageUrl = ?,
           featured = ?, available = ?, veg = ?, updatedAt = datetime('now')
       WHERE id = ?`
    ).run(
      categoryId,
      name,
      String(body.description ?? existing.description ?? "").trim(),
      price,
      stock,
      imageUrl,
      body.featured === undefined ? existing.featured : body.featured ? 1 : 0,
      body.available === undefined ? existing.available : body.available ? 1 : 0,
      body.veg === undefined ? existing.veg : body.veg ? 1 : 0,
      Number(id)
    );

    const row = db.prepare(`${SELECT} WHERE i.id = ?`).get(Number(id)) as Record<string, unknown>;
    return ok(mapItem(row), "Item updated");
  } catch (error) {
    return badRequest(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  db.prepare("DELETE FROM food_items WHERE id = ?").run(Number(id));
  return ok({ id: Number(id) }, "Item deleted");
}
