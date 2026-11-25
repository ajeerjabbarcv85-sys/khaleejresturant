import { getAdmin } from "@/lib/auth";
import { ok } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdmin();
  return ok({ authenticated: Boolean(admin), admin });
}
