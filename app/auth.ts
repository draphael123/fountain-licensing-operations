import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "fountain_admin_session";

function sessionValue() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update("fountain-admin").digest("hex");
}

export async function isAuthenticated() {
  const expected = sessionValue();
  const actual = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!expected || !actual || expected.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function validCredentials(username: string, password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (username !== "admin" || !expected || password.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}

export function createSessionValue() {
  return sessionValue();
}
