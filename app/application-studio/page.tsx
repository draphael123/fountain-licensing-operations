import Link from "next/link";
import ApplicationStudio from "../application-studio";
import LoginForm from "../login-form";
import { isAuthenticated } from "../auth";

export const dynamic = "force-dynamic";

export default async function ApplicationStudioPage() {
  if (!(await isAuthenticated())) {
    return <LoginForm product="Application Studio" destination="/application-studio" />;
  }

  return (
    <main className="studio-tool">
      <header className="studio-topbar">
        <div className="brand">
          <span className="brand-mark">F</span>
          <span className="brand-word">Fountain</span>
          <span className="brand-divider" />
          <span className="brand-product">Application Studio</span>
          <span className="prototype">Synthetic prototype</span>
        </div>
        <div className="access">
          <Link className="tool-link" href="/">New States</Link>
          <span className="lock">●</span>
          <span>Private workspace</span>
          <form action="/api/logout" method="post"><button className="sign-out" type="submit">Sign out</button></form>
        </div>
      </header>
      <div className="studio-tool-content"><ApplicationStudio /></div>
    </main>
  );
}
