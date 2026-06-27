// import { env } from "@chatapp/env";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.DATABASE_URL!);
await client.connect();

const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),

  baseURL: { 
    allowedHosts: [
      '*zerosquadron.com',
      '*angerbunny.com',
      '*localhost',
      '127.0.0.1',
    ],
    fallback: 'https://zerosquadron.com',
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
  },
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    rateLimit: {
      window: 15, // 15 minutes
      max: 100, // limit each IP to 100 requests per window
    },
  },
});
