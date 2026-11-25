import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-helpers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = String(params.get("code") || "").trim().toUpperCase();
  const phone = String(params.get("phone") || "").replace(/[\s+-]/g, "").slice(-10);

  if (!code || !phone) return fail("Enter your order number and phone number");

  const order = db
    .prepare("SELECT * FROM orders WHERE orderCode = ? AND phone LIKE ?")
    .get(code, `%${phone}`) as Record<string, unknown> | undefined;
  if (!order) return fail("No order found with those details", 404);

  const items = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(Number(order.id));
  return ok({ ...order, items });
}
