import { NextRequest } from "next/server";
import { badRequest, fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const all = request.nextUrl.searchParams.get("all") === "1";
  if (all && !(await requireAdmin())) return fail("Unauthorized", 401);
  const rows = db
    .prepare(
      `SELECT * FROM feedback ${all ? "" : "WHERE approved = 1"} ORDER BY createdAt DESC LIMIT 30`
    )
    .all();
  return ok(rows);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { name?: string; rating?: number; message?: string };
    const name = String(body.name || "").trim();
    const rating = Math.floor(Number(body.rating));
    const message = String(body.message || "").trim();
    if (name.length < 2) return fail("Enter your name");
    if (rating < 1 || rating > 5) return fail("Choose a rating between 1 and 5");
    if (message.length < 10) return fail("Tell us a little more about your experience");

    const result = db
      .prepare("INSERT INTO feedback (name, rating, message, approved) VALUES (?, ?, ?, 0)")
      .run(name, rating, message);
    return ok({ id: Number(result.lastInsertRowid) }, "Thank you for your feedback");
  } catch (error) {
    return badRequest(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as { id?: number; approved?: boolean };
    const id = Number(body.id);
    if (!id) return fail("Feedback id is required");
    db.prepare("UPDATE feedback SET approved = ? WHERE id = ?").run(
      body.approved === false ? 0 : 1,
      id
    );
    return ok({ id }, "Feedback updated");
  } catch (error) {
    return badRequest(error);
  }
}
