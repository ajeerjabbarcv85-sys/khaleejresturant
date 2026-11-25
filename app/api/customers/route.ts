import { fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const rows = db
    .prepare(
      `SELECT c.*,
              COUNT(o.id) AS orders,
              COALESCE(SUM(CASE WHEN o.status NOT IN ('CANCELLED') THEN o.total ELSE 0 END), 0) AS spent
       FROM customers c
       LEFT JOIN orders o ON o.customerId = c.id
       GROUP BY c.id
       ORDER BY c.createdAt DESC, c.id DESC`
    )
    .all() as Record<string, unknown>[];

  const history = db
    .prepare(
      `SELECT o.id, o.orderCode, o.total, o.status, o.createdAt
       FROM orders o ORDER BY o.createdAt DESC, o.id DESC`
    )
    .all();

  const customers: (Customer & { history?: unknown[] })[] = rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: String(row.email || ""),
    orders: Number(row.orders),
    spent: Number(row.spent),
    createdAt: String(row.createdAt),
  }));

  const ordersByPhone = new Map<string, unknown[]>();
  (history as { phone?: string }[]).forEach((order) => {
    const phone = String(order.phone || "");
    const list = ordersByPhone.get(phone) || [];
    list.push(order);
    ordersByPhone.set(phone, list);
  });
  customers.forEach((customer) => {
    customer.history = (ordersByPhone.get(customer.phone) || []).slice(0, 8);
  });

  return ok(customers);
}
