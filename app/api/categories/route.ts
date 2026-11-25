import { NextRequest } from "next/server";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db, mapCategory } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const all = request.nextUrl.searchParams.get("all") === "1";
  if (all && !(await requireAdmin())) return fail("Unauthorized", 401);

  const rows = db
    .prepare(
      `SELECT c.*, COUNT(i.id) AS itemCount
       FROM food_categories c
       LEFT JOIN food_items i ON i.categoryId = c.id
       ${all ? "" : "WHERE c.active = 1"}
       GROUP BY c.id
       ORDER BY c.sortOrder, c.name`
    )
    .all() as Record<string, unknown>[];

  return ok(rows.map(mapCategory) as Category[]);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as Partial<Category>;
    const name = String(body.name || "").trim();
    if (!name) return fail("Category name is required");

    const slug = slugify(body.slug || name);
    const existing = db
      .prepare("SELECT id FROM food_categories WHERE slug = ? OR name = ?")
      .get(slug, name);
    if (existing) return fail("A category with that name already exists", 409);

    const result = db
      .prepare(
        `INSERT INTO food_categories (name, slug, description, image, sortOrder, active)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        name,
        slug,
        String(body.description || "").trim(),
        String(body.image || "").trim(),
        Number(body.sortOrder || 0),
        body.active === false ? 0 : 1
      );

    const row = db
      .prepare("SELECT * FROM food_categories WHERE id = ?")
      .get(Number(result.lastInsertRowid)) as Record<string, unknown>;
    return ok(mapCategory(row), "Category created");
  } catch (error) {
    return badRequest(error);
  }
}
