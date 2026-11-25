import { NextRequest } from "next/server";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const all = params.get("all") === "1";
  if (all && !(await requireAdmin())) return fail("Unauthorized", 401);

  if (params.get("code")) {
    const code = String(params.get("code")).trim().toUpperCase();
    const subtotal = Number(params.get("subtotal") || 0);
    const coupon = db
      .prepare("SELECT * FROM coupons WHERE code = ? AND active = 1")
      .get(code) as
      | {
          id: number;
          code: string;
          type: string;
          value: number;
          minOrder: number;
          expiresAt: string | null;
          usageLimit: number | null;
          usedCount: number;
        }
      | undefined;
    if (!coupon) return fail("Invalid coupon code", 404);
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now())
      return fail("Coupon has expired", 400);
    if (subtotal < coupon.minOrder)
      return fail(`Minimum order for ${code} is ${coupon.minOrder}`, 400);
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
      return fail("Coupon limit reached", 400);

    const discount =
      coupon.type === "PERCENT"
        ? Math.round((subtotal * coupon.value) / 100)
        : Math.min(coupon.value, subtotal);
    return ok({ code: coupon.code, discount, type: coupon.type, value: coupon.value }, "Coupon applied");
  }

  const rows = db
    .prepare(`SELECT * FROM coupons ${all ? "" : "WHERE active = 1"} ORDER BY id DESC`)
    .all();
  return ok(rows);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const code = String(body.code || "").trim().toUpperCase();
    if (!code) return fail("Coupon code is required");
    const result = db
      .prepare(
        `INSERT INTO coupons (code, type, value, minOrder, active, expiresAt, usageLimit)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        code,
        body.type === "FIXED" ? "FIXED" : "PERCENT",
        Number(body.value) || 0,
        Number(body.minOrder) || 0,
        body.active === false ? 0 : 1,
        body.expiresAt ? String(body.expiresAt) : null,
        body.usageLimit ? Number(body.usageLimit) : null
      );
    return ok({ id: Number(result.lastInsertRowid), code }, "Coupon created");
  } catch (error) {
    return badRequest(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as { id?: number; active?: boolean };
    const id = Number(body.id);
    if (!id) return fail("Coupon id is required");
    db.prepare("UPDATE coupons SET active = ? WHERE id = ?").run(
      body.active === false ? 0 : 1,
      id
    );
    return ok({ id }, "Coupon updated");
  } catch (error) {
    return badRequest(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) return fail("Coupon id is required");
  db.prepare("DELETE FROM coupons WHERE id = ?").run(id);
  return ok({ id }, "Coupon deleted");
}
