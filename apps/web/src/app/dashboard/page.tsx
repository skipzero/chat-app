import { redirect } from "next/navigation";
import Dashboard from "./dashboard";
import { headers } from "next/headers";
import { auth } from "@nextBetterMongoDB/auth";
import { authClient } from "@/lib/auth-client";

export default async function DashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	const name = session.user.name || 'friend'

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome { name }</p>
			<Dashboard session={session} />
		</div>
	);
}
