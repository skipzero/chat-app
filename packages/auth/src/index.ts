// import { env } from "@chatapp/env";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

// const { CORS_ORIGIN, DATABASE_NAME, DATABASE_URL } = process.env;

const client = new MongoClient(process.env.DATABASE_URL!);
await client.connect();

const db = client.db(process.env.DATABASE_NAME!);

export const auth = betterAuth({
  database: mongodbAdapter(db),
  trustedOrigins: [process.env.CORS_ORIGIN!],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
});
