import { NextRequest } from "next/server";
import { fail, ok, requireAdmin } from "@/lib/api-helpers";
import { db, getSettings } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/defaults";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok(getSettings());
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const allowed = Object.keys(DEFAULT_SETTINGS);
    const update = db.prepare(
      "INSERT INTO restaurant_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    );
    db.transaction(() => {
      allowed.forEach((key) => {
        if (body[key] !== undefined) update.run(key, JSON.stringify(body[key]));
      });
    })();
    return ok(getSettings(), "Settings saved");
  } catch {
    return fail("Unable to save settings");
  }
}
