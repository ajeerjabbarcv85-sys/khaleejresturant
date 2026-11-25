import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db, getSettings } from "@/lib/db";
import { isValidEmail, isValidPhone, todayISO } from "@/lib/utils";
import type { Reservation } from "@/lib/types";

export const dynamic = "force-dynamic";

const SELECT = `
  SELECT r.*, t.name AS tableName
  FROM reservations r
  LEFT JOIN restaurant_tables t ON t.id = r.tableId
`;

function tableIsFree(tableId: number, date: string, time: string, ignoreId = 0): boolean {
  const conflict = db
    .prepare(
      `SELECT id FROM reservations
       WHERE tableId = ? AND date = ? AND time = ?
         AND status IN ('PENDING', 'APPROVED') AND id != ?`
    )
    .get(tableId, date, time, ignoreId);
  return !conflict;
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const date = request.nextUrl.searchParams.get("date");
  const rows = db
    .prepare(`${SELECT} ${date ? "WHERE r.date = ?" : ""} ORDER BY r.date, r.time`)
    .all(...(date ? [date] : [])) as Record<string, unknown>[];
  return ok(rows as Reservation[]);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Reservation> & { tableId?: number | null };
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").replace(/[\s+-]/g, "").slice(-10);
    const email = String(body.email || "").trim();
    const date = String(body.date || "").trim();
    const time = String(body.time || "").trim();
    const guests = Math.floor(Number(body.guests));
    const notes = String(body.notes || "").trim();

    if (name.length < 2) return fail("Enter your name");
    if (!isValidPhone(phone)) return fail("Enter a valid 10-digit phone number");
    if (email && !isValidEmail(email)) return fail("Enter a valid email address");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayISO())
      return fail("Choose a valid future date");
    const slots = getSettings().timeSlots || [];
    if (!slots.includes(time)) return fail("Choose an available time slot");
    if (!Number.isFinite(guests) || guests < 1 || guests > 8)
      return fail("Choose between 1 and 8 guests");

    const tableId = Number(body.tableId || 0);
    if (!tableId) return fail("Choose a table for your reservation", 400);

    const table = db
      .prepare("SELECT * FROM restaurant_tables WHERE id = ? AND active = 1")
      .get(tableId) as { id: number; seats: number } | undefined;
    if (!table) return fail("That table is not available", 400);
    if (table.seats < guests) return fail(`That table seats only ${table.seats} guests`, 400);

    const code = `RSV-${randomBytes(3).toString("hex").toUpperCase()}`;
    const insertReservation = db.transaction(() => {
      if (!tableIsFree(tableId, date, time)) throw new Error("TABLE_TAKEN");
      return db
        .prepare(
          `INSERT INTO reservations (code, name, phone, email, date, time, guests, tableId, notes, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`
        )
        .run(code, name, phone, email, date, time, guests, tableId, notes);
    });

    let result: { lastInsertRowid: number | bigint } | undefined;
    try {
      result = insertReservation();
    } catch (error) {
      if (error instanceof Error && error.message === "TABLE_TAKEN") {
        return fail("That table is already booked for this slot. Choose another table.", 409);
      }
      throw error;
    }

    const row = db.prepare(`${SELECT} WHERE r.id = ?`).get(Number(result?.lastInsertRowid ?? 0)) as
      | Record<string, unknown>
      | undefined;
    return ok(row, "Reservation request received");
  } catch (error) {
    return badRequest(error);
  }
}
