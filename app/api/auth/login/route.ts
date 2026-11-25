import { NextRequest } from "next/server";
import { loginAdmin, setSessionCookie } from "@/lib/auth";
import { fail, ok } from "@/lib/api-helpers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) return fail("Username and password are required");

    const token = loginAdmin(username, password);
    if (!token) return fail("Incorrect username or password", 401);

    await setSessionCookie(token);
    return ok({ username: username.toLowerCase() }, "Signed in successfully");
  } catch {
    return fail("Unable to sign in");
  }
}
