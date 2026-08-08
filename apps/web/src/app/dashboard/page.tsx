import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { authClient } from "@/lib/auth-client";

import Dashboard from "./dashboard";

type Session = typeof authClient.$Infer.Session;

export default async function DashboardPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const protocol = h.get("x-forwarded-proto") || "http";
  const baseURL = `${protocol}://${host}`;

  const response = await fetch(`${baseURL}/api/auth/session`, {
    headers: { cookie: h.get("cookie") || "" },
  });

  if (!response.ok) {
    redirect("/login");
  }

  const session: Session | null = await response.json();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome {session.user.name}</p>
      <Dashboard session={session} />
    </div>
  );
}
