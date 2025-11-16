"use client";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function Rooms({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	const privateData = useQuery(orpc.privateData.queryOptions());
	const todos = useQuery(orpc.rooms.getAll.queryOptions());
	
	return (
		<>
			<div className="mx-auto w-full max-w-md py-10">

			</div>
		</>
	);}

	export function ChatsPage({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	const privateData = useQuery(orpc.privateData.queryOptions());

	return (
		<>

		</>
	);}