"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="login-brand"><span className="brand-mark">F</span><span>Fountain</span></div>
        <p className="eyebrow">Private workspace</p>
        <h1>New States</h1>
        <p className="login-copy">Sign in to review launch readiness, licensing blockers, and next actions.</p>
        <form action={action} className="login-form">
          <label>Username<input name="username" autoComplete="username" defaultValue="admin" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required autoFocus /></label>
          {state.error && <p className="login-error" role="alert">{state.error}</p>}
          <button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="login-note">Authorized Fountain team members only</p>
      </section>
    </main>
  );
}
