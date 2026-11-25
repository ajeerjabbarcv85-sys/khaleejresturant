import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";

export function ok<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, message });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) return null;
  return admin;
}

export function badRequest(error: unknown) {
  return fail(error instanceof Error ? error.message : "Invalid request", 400);
}
