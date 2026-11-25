import { NextRequest } from "next/server";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import { ORDER_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(Number(id)) as
    | Record<string, unknown>
    | undefined;
  if (!order) return fail("Order not found", 404);
  const items = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(Number(id));
  return ok({ ...order, items });
}

export async function PATCH(request: NextRequest, { params }: Context) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  try {
    const body = (await request.json()) as {
      status?: string;
      paymentStatus?: string;
      notes?: string;
    };
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(Number(id)) as
      | Record<string, unknown>
      | undefined;
    if (!order) return fail("Order not found", 404);

    const status = body.status ? String(body.status).toUpperCase() : String(order.status);
    if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number]))
      return fail("Invalid order status");

    const paymentStatus = body.paymentStatus
      ? String(body.paymentStatus).toUpperCase()
      : String(order.paymentStatus);
    if (!["PENDING", "PAID", "FAILED", "REFUNDED"].includes(paymentStatus))
      return fail("Invalid payment status");

    db.transaction(() => {
      db.prepare(
        `UPDATE orders SET status = ?, paymentStatus = ?, notes = ?, updatedAt = datetime('now') WHERE id = ?`
      ).run(
        status,
        paymentStatus,
        body.notes === undefined ? String(order.notes || "") : String(body.notes).trim(),
        Number(id)
      );

      if (status === "PAID" || (body.paymentStatus && paymentStatus === "PAID")) {
        db.prepare(
          "UPDATE payments SET status = 'PAID' WHERE orderId = ? AND status != 'PAID'"
        ).run(Number(id));
      }

      const wasRestored = Number(order.stockRestored || 0) === 1;
      if (status === "CANCELLED" && !wasRestored) {
        const items = db
          .prepare("SELECT itemId, qty FROM order_items WHERE orderId = ?")
          .all(Number(id)) as { itemId: number; qty: number }[];
        const restore = db.prepare("UPDATE food_items SET stock = stock + ? WHERE id = ?");
        items.forEach((line) => restore.run(Number(line.qty), Number(line.itemId)));
        db.prepare("UPDATE orders SET stockRestored = 1 WHERE id = ?").run(Number(id));
        if (String(order.couponCode || "")) {
          db.prepare("UPDATE coupons SET usedCount = MAX(0, usedCount - 1) WHERE code = ?").run(
            String(order.couponCode)
          );
        }
      }
    })();

    return ok({ id: Number(id), status, paymentStatus }, "Order updated");
  } catch (error) {
    return badRequest(error);
  }
}
