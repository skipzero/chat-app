import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
export const env = createEnv({
  server: {
    DATABASE_NAME: z.string().min(1).default("chatdb"),
    DATABASE_URL: z.string().min(1).default("mongodb://127.0.0.1:27017/chatdb"),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
