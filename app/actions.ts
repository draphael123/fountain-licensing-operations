"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionValue, SESSION_COOKIE, validCredentials } from "./auth";

export async function login(_: { error: string }, formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const session = createSessionValue();
  if (!session || !validCredentials(username, password)) return { error: "The username or password is incorrect." };

  const requestedDestination = String(formData.get("destination") ?? "/");
  const destination = requestedDestination === "/application-studio" ? requestedDestination : "/";

  (await cookies()).set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  redirect(destination);
}
