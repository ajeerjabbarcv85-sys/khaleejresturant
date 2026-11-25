import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const ADMIN_COOKIE = "kaleej_admin";
const SESSION_DAYS = 7;

export type Admin = { id: number; username: string };

export function loginAdmin(username: string, password: string): string | null {
  const admin = db
    .prepare("SELECT id, username, passwordHash FROM admins WHERE username = ?")
    .get(username.trim().toLowerCase()) as
    | { id: number; username: string; passwordHash: string }
    | undefined;

  if (!admin || !verifyPassword(password, admin.passwordHash)) return null;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  db.prepare(
    "INSERT INTO admin_sessions (token, adminId, expiresAt) VALUES (?, ?, ?)"
  ).run(token, admin.id, expiresAt);
  return token;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function getAdmin(): Promise<Admin | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const row = db
    .prepare(
      `SELECT a.id, a.username, s.expiresAt
       FROM admin_sessions s
       JOIN admins a ON a.id = s.adminId
       WHERE s.token = ?`
    )
    .get(token) as { id: number; username: string; expiresAt: string } | undefined;

  if (!row) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    db.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
    return null;
  }
  return { id: row.id, username: row.username };
}

export async function clearSession() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) db.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
  store.delete(ADMIN_COOKIE);
}
