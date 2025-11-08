"use client";
import { authClient } from "@/lib/auth-client";

export default function Profile({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  return <></>;
}
