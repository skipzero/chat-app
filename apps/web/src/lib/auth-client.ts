import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: { 
    allowedHosts: [
      '*zerosquadron.com',
      '*angerbunny.com',
    ],
    fallback: 'https://zerosquadron.com',
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
})
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
