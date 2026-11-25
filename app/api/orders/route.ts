import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db, getSettings, mapItem } from "@/lib/db";
import { isValidEmail, isValidPhone } from "@/lib/utils";
import type { CheckoutPayload, Order } from "@/lib/types";

export const dynamic = "force-dynamic";

const SELECT = "SELECT * FROM orders";

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const status = request.nextUrl.searchParams.get("status");
  const rows = db
    .prepare(`${SELECT} ${status ? "WHERE status = ?" : ""} ORDER BY createdAt DESC, id DESC`)
    .all(...(status ? [status] : [])) as Record<string, unknown>[];

  const itemsStatement = db.prepare("SELECT * FROM order_items WHERE orderId = ?");
  const orders: Order[] = rows.map((row) => ({
    ...(row as unknown as Order),
    id: Number(row.id),
    items: itemsStatement.all(Number(row.id)) as Order["items"],
  }));

  return ok(orders);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutPayload;

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").replace(/[\s+-]/g, "").slice(-10);
    const email = String(body.email || "").trim();
    const address = String(body.address || "").trim();
    const orderType = body.orderType === "PICKUP" ? "PICKUP" : "DELIVERY";
    const paymentMethod = ["COD", "UPI", "CARD", "NETBANKING"].includes(body.paymentMethod)
      ? body.paymentMethod
      : "COD";
    const notes = String(body.notes || "").trim();

    if (name.length < 2) return fail("Enter your full name");
    if (!isValidPhone(phone)) return fail("Enter a valid 10-digit phone number");
    if (email && !isValidEmail(email)) return fail("Enter a valid email address");
    if (orderType === "DELIVERY" && address.length < 8) return fail("Enter a complete delivery address");

    const requested = Array.isArray(body.items)
      ? body.items
          .map((line) => ({
            itemId: Number(line.itemId),
            qty: Math.floor(Number(line.qty)),
          }))
          .filter((line) => Number.isFinite(line.itemId) && line.qty > 0)
      : [];
    if (!requested.length) return fail("Your cart is empty");

    const fetchItem = db.prepare("SELECT * FROM food_items WHERE id = ?");
    const resolved = requested.map((line) => {
      const row = fetchItem.get(line.itemId) as Record<string, unknown> | undefined;
      if (!row) throw new Error("One of the items is no longer available");
      if (!row.available || Number(row.stock) <= 0)
        throw new Error(`${String(row.name)} is currently unavailable`);
      if (line.qty > Number(row.stock))
        throw new Error(`Only ${Number(row.stock)} ${String(row.name)} left in stock`);
      const item = mapItem(row);
      return { item, qty: line.qty };
    });

    const settings = getSettings();
    const subtotal = resolved.reduce((sum, line) => sum + line.item.price * line.qty, 0);
    let discount = 0;
    let couponCode: string | null = null;

    if (body.couponCode) {
      const code = String(body.couponCode).trim().toUpperCase();
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

      if (!coupon) return fail("That coupon code is not valid", 400);
      if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now())
        return fail("That coupon has expired", 400);
      if (subtotal < coupon.minOrder)
        return fail(`Add ${Math.ceil(coupon.minOrder - subtotal)} more to use ${code}`, 400);
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
        return fail("That coupon has reached its limit", 400);

      discount =
        coupon.type === "PERCENT"
          ? Math.round((subtotal * coupon.value) / 100)
          : Math.min(Number(coupon.value), subtotal);
      couponCode = coupon.code;
    }

    const taxable = Math.max(0, subtotal - discount);
    const tax = Math.round((taxable * Number(settings.taxPercent || 0)) / 100);
    const deliveryFee =
      orderType === "PICKUP" || subtotal >= Number(settings.freeDeliveryAbove || 0)
        ? 0
        : Number(settings.deliveryFee || 0);
    const total = taxable + tax + deliveryFee;
    const orderCode = `KLJ-${randomBytes(3).toString("hex").toUpperCase()}`;

    const result = db.transaction(() => {
      let customerId: number | null = null;
      const existingCustomer = db
        .prepare("SELECT id FROM customers WHERE phone = ?")
        .get(phone) as { id: number } | undefined;
      if (existingCustomer) {
        customerId = existingCustomer.id;
        db.prepare("UPDATE customers SET name = ?, email = ? WHERE id = ?").run(
          name,
          email,
          customerId
        );
      } else {
        const created = db
          .prepare("INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)")
          .run(name, phone, email);
        customerId = Number(created.lastInsertRowid);
      }

      const orderResult = db
        .prepare(
          `INSERT INTO orders
            (orderCode, customerId, name, phone, email, address, orderType, paymentMethod,
             subtotal, tax, deliveryFee, discount, total, couponCode, status, paymentStatus, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`
        )
        .run(
          orderCode,
          customerId,
          name,
          phone,
          email,
          orderType === "PICKUP" ? "Pickup from Kaleej" : address,
          orderType,
          paymentMethod,
          subtotal,
          tax,
          deliveryFee,
          discount,
          total,
          couponCode,
          paymentMethod === "COD" ? "PENDING" : "PENDING",
          notes
        );

      const orderId = Number(orderResult.lastInsertRowid);
      const insertItem = db.prepare(
        `INSERT INTO order_items (orderId, itemId, name, price, qty, imageUrl)
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      const deduct = db.prepare(
        "UPDATE food_items SET stock = MAX(0, stock - ?), updatedAt = datetime('now') WHERE id = ?"
      );

      resolved.forEach(({ item, qty }) => {
        insertItem.run(orderId, item.id, item.name, item.price, qty, item.imageUrl);
        deduct.run(qty, item.id);
      });

      db.prepare(
        "INSERT INTO payments (orderId, method, amount, status) VALUES (?, ?, ?, 'PENDING')"
      ).run(orderId, paymentMethod, total);
      if (couponCode)
        db.prepare("UPDATE coupons SET usedCount = usedCount + 1 WHERE code = ?").run(couponCode);

      return orderId;
    })();

    return ok(
      { orderId: result, orderCode, total, status: "PENDING", orderType, address },
      "Order placed successfully"
    );
  } catch (error) {
    return badRequest(error);
  }
}
