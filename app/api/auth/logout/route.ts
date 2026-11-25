import { clearSession } from "@/lib/auth";
import { ok } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearSession();
  return ok({ signedOut: true }, "Signed out");
}
