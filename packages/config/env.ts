import 'dotenv/config'
import { z } from 'zod'

const EnvSchema = z.object({
  PORT: z.number().default(3000),
  DATABASE_NAME: z.string().default('chatapp'),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  CORS_ORIGIN: z.url()
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
