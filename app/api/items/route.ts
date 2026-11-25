import { NextRequest } from "next/server";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db, mapItem } from "@/lib/db";
import { saveDataUrl } from "@/lib/upload";
import { slugify } from "@/lib/utils";
import type { FoodItem } from "@/lib/types";

export const dynamic = "force-dynamic";

const SELECT = `
  SELECT i.*, c.name AS categoryName
  FROM food_items i
  JOIN food_categories c ON c.id = i.categoryId
`;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const all = ["1", "true"].includes(params.get("all") || "");
  if (all && !(await requireAdmin())) return fail("Unauthorized", 401);

  const clauses: string[] = [];
  const values: (string | number)[] = [];

  if (!all) {
    clauses.push("i.available = 1", "c.active = 1");
  }
  const category = params.get("category");
  if (category && category !== "all") {
    clauses.push("c.slug = ?");
    values.push(category);
  }
  if (params.get("featured") === "1") clauses.push("i.featured = 1");
  const search = params.get("search")?.trim();
  if (search) {
    clauses.push("(i.name LIKE ? OR i.description LIKE ?)");
    values.push(`%${search}%`, `%${search}%`);
  }

  const limit = Math.min(Math.max(Number(params.get("limit")) || 500, 1), 1000);
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(`${SELECT} ${where} ORDER BY c.sortOrder, i.featured DESC, i.name LIMIT ?`)
    .all(...values, limit) as Record<string, unknown>[];

  return ok(rows.map(mapItem) as FoodItem[]);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as Partial<FoodItem> & { imageData?: string };
    const name = String(body.name || "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock);
    const categoryId = Number(body.categoryId);

    if (!name) return fail("Item name is required");
    if (!Number.isFinite(price) || price < 0) return fail("Enter a valid price");
    if (!Number.isFinite(stock) || stock < 0) return fail("Enter a valid stock value");
    if (!db.prepare("SELECT id FROM food_categories WHERE id = ?").get(categoryId))
      return fail("Choose a valid category");

    let imageUrl = String(body.imageUrl || "").trim();
    if (body.imageData) {
      const saved = saveDataUrl(body.imageData);
      if (saved) imageUrl = saved;
    }

    const result = db
      .prepare(
        `INSERT INTO food_items
          (categoryId, name, slug, description, price, stock, imageUrl, featured, available, veg)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        categoryId,
        name,
        `${slugify(name)}-${Date.now().toString(36)}`,
        String(body.description || "").trim(),
        price,
        stock,
        imageUrl,
        body.featured ? 1 : 0,
        body.available === false ? 0 : 1,
        body.veg === false ? 0 : 1
      );

    const id = Number(result.lastInsertRowid);
    db.prepare(
      "INSERT INTO food_images (itemId, url, alt, sortOrder) VALUES (?, ?, ?, 0)"
    ).run(id, imageUrl, name);

    const row = db.prepare(`${SELECT} WHERE i.id = ?`).get(id) as Record<string, unknown>;
    return ok(mapItem(row), "Item created");
  } catch (error) {
    return badRequest(error);
  }
}
