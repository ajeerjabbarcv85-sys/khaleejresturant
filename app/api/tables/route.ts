import { NextRequest } from "next/server";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const date = params.get("date") || "";
  const time = params.get("time") || "";
  const guests = Number(params.get("guests") || 0);

  const rows = db.prepare("SELECT * FROM restaurant_tables ORDER BY seats, name").all() as {
    id: number;
    name: string;
    seats: number;
    active: number;
  }[];

  const bookedIds = new Set<number>();
  if (date && time) {
    const booked = db
      .prepare(
        `SELECT DISTINCT tableId FROM reservations
         WHERE date = ? AND time = ?
           AND status IN ('PENDING', 'APPROVED')
           AND tableId IS NOT NULL`
      )
      .all(date, time) as { tableId: number }[];
    booked.forEach((row) => bookedIds.add(Number(row.tableId)));
  }

  return ok(
    rows
      .filter((table) => table.active)
      .map((table) => ({
        ...table,
        active: Boolean(table.active),
        available: date && time ? !bookedIds.has(Number(table.id)) : true,
        fitsGuests: guests > 0 ? table.seats >= guests : true,
      }))
  );
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as { name?: string; seats?: number };
    const name = String(body.name || "").trim();
    const seats = Math.floor(Number(body.seats));
    if (!name || !Number.isFinite(seats) || seats < 1) return fail("Enter a table name and seat count");
    const result = db
      .prepare("INSERT INTO restaurant_tables (name, seats, active) VALUES (?, ?, 1)")
      .run(name, seats);
    return ok({ id: Number(result.lastInsertRowid), name, seats }, "Table added");
  } catch (error) {
    return badRequest(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as {
      id?: number;
      name?: string;
      seats?: number;
      active?: boolean;
    };
    const id = Number(body.id);
    if (!id) return fail("Table id is required");
    db.prepare("UPDATE restaurant_tables SET name = ?, seats = ?, active = ? WHERE id = ?").run(
      String(body.name || "").trim(),
      Math.floor(Number(body.seats)),
      body.active === false ? 0 : 1,
      id
    );
    return ok({ id }, "Table updated");
  } catch (error) {
    return badRequest(error);
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const id = Number(request.nextUrl.searchParams.get("id"));
  if (!id) return fail("Table id is required");
  db.prepare("DELETE FROM restaurant_tables WHERE id = ?").run(id);
  return ok({ id }, "Table deleted");
}
