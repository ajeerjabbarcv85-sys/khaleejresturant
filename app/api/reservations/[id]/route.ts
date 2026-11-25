import { NextRequest } from "next/server";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db } from "@/lib/db";
import type { ReservationStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

const SELECT = `
  SELECT r.*, t.name AS tableName
  FROM reservations r
  LEFT JOIN restaurant_tables t ON t.id = r.tableId
`;

export async function PATCH(request: NextRequest, { params }: Context) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  try {
    const body = (await request.json()) as {
      status?: ReservationStatus;
      tableId?: number | null;
      date?: string;
      time?: string;
      guests?: number;
    };
    const row = db.prepare("SELECT * FROM reservations WHERE id = ?").get(Number(id)) as
      | Record<string, unknown>
      | undefined;
    if (!row) return fail("Reservation not found", 404);

    const status = body.status ? String(body.status).toUpperCase() : String(row.status);
    if (!["PENDING", "APPROVED", "CANCELLED", "COMPLETED"].includes(status))
      return fail("Invalid reservation status");

    const date = String(body.date || row.date);
    const time = String(body.time || row.time);
    const tableId = body.tableId === null ? null : Number(body.tableId ?? row.tableId);

    if (status !== "CANCELLED" && status !== "COMPLETED" && tableId) {
      const conflict = db
        .prepare(
          `SELECT id FROM reservations
           WHERE tableId = ? AND date = ? AND time = ?
             AND status IN ('PENDING', 'APPROVED') AND id != ?`
        )
        .get(tableId, date, time, Number(id));
      if (conflict) return fail("That table is already booked for this slot", 409);
    }

    db.prepare(
      `UPDATE reservations SET status = ?, date = ?, time = ?, tableId = ? WHERE id = ?`
    ).run(status, date, time, tableId, Number(id));

    const updated = db.prepare(`${SELECT} WHERE r.id = ?`).get(Number(id));
    return ok(updated, "Reservation updated");
  } catch (error) {
    return badRequest(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  db.prepare("DELETE FROM reservations WHERE id = ?").run(Number(id));
  return ok({ id: Number(id) }, "Reservation deleted");
}
