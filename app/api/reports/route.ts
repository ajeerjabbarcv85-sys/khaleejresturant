import { ok, requireAdmin, fail } from "@/lib/api-helpers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);

  const orders = db
    .prepare("SELECT * FROM orders WHERE status != 'CANCELLED'")
    .all() as {
    id: number;
    total: number;
    createdAt: string;
    status: string;
  }[];

  const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayRevenue = orders
    .filter((order) => String(order.createdAt).slice(0, 10) === today)
    .reduce((sum, order) => sum + Number(order.total), 0);

  const last7 = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      date: key,
      revenue: orders
        .filter((order) => String(order.createdAt).slice(0, 10) === key)
        .reduce((sum, order) => sum + Number(order.total), 0),
      orders: orders.filter((order) => String(order.createdAt).slice(0, 10) === key).length,
    };
  });

  const last12 = Array.from({ length: 12 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      label: date.toLocaleDateString("en-IN", { month: "short" }),
      revenue: orders
        .filter((order) => String(order.createdAt).slice(0, 7) === key)
        .reduce((sum, order) => sum + Number(order.total), 0),
      orders: orders.filter((order) => String(order.createdAt).slice(0, 7) === key).length,
    };
  });

  const popular = db
    .prepare(
      `SELECT oi.name, oi.imageUrl, SUM(oi.qty) AS qty, SUM(oi.price * oi.qty) AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.orderId
       WHERE o.status != 'CANCELLED'
       GROUP BY oi.itemId, oi.name
       ORDER BY qty DESC
       LIMIT 8`
    )
    .all();

  const statusCounts = db
    .prepare("SELECT status, COUNT(*) AS count FROM orders GROUP BY status")
    .all();

  return ok({
    summary: {
      revenue,
      todayRevenue,
      totalOrders: orders.length,
      todayOrders: orders.filter((order) => String(order.createdAt).slice(0, 10) === today).length,
      averageOrder: orders.length ? Math.round(revenue / orders.length) : 0,
    },
    weekly: last7,
    monthly: last12,
    popular,
    statusCounts,
  });
}
