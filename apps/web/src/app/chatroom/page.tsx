import { redirect } from "next/navigation";
import ChatRoom from "./chatroom";
import { headers } from "next/headers";
import { auth } from "@nextBetterMongoDB/auth";
import { authClient } from "@/lib/auth-client";

export default async function ChatRoomPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	const name = session.user.name || 'friend'

	return (
		<div>
			<h1>ChatRoom</h1>
			<p>Welcome { name }</p>
			<ChatRoom session={session} />
		</div>
	);
}
