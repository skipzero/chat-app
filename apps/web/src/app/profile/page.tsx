import { redirect } from "next/navigation";
import Profile from "./profile";
import { headers } from "next/headers";
import { auth } from "@nextBetterMongoDB/auth";
import { authClient } from "@/lib/auth-client";

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const name = session.user.name || 'friend'

  return (
    <div>
      <h1>Profile</h1>
      <p>Welcome { name }</p>
      <Profile session={session} />
    </div>
  );
}
