import { redirect } from "next/navigation";
import { Rooms } from "./rooms";
import { headers } from "next/headers";
import { auth } from "@chat-app/auth";

export default async function ChatsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Chat Rooms</h1>
      <p>Welcome {session.user.name}</p>
      <Rooms session={session} />
    </div>
  );
}
