// import 'dotenv/config';

export const chatEnv = {
  PORT: process.env.PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_URL: process.env.DATABASE_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  NODE_ENV: ['development', 'production', 'test'],
  
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
}
