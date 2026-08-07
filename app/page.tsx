import Dashboard from "./dashboard";
import LoginForm from "./login-form";
import { isAuthenticated } from "./auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (await isAuthenticated()) ? <Dashboard /> : <LoginForm />;
}
