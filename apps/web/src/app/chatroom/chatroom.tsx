"use client";
import { authClient } from "@/lib/auth-client";

export default function ChatRoom({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	return <></>;
}
