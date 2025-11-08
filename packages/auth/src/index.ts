import { nextCookies } from 'better-auth/next-js';
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "@nextBetterMongoDB/db";

export const auth = betterAuth<BetterAuthOptions>({
	database: mongodbAdapter(client),
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
  plugins: [nextCookies()]
});
