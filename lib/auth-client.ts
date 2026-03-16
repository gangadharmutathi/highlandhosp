// lib/auth-client.ts
//
// Better Auth CLIENT configuration.
// This file is used in client components ("use client") and browser code.
//
// Why a separate file from lib/auth.ts?
// lib/auth.ts imports Prisma and runs on the server only.
// Client components cannot import server-only code.
// Better Auth solves this by providing a separate lightweight client
// that communicates with the server via API calls.
//
// Usage in client components:
//   import { authClient } from "@/lib/auth-client";
//   const { data: session } = authClient.useSession();

import { createAuthClient } from "better-auth/react";
import type { Auth } from "./auth";

export const authClient = createAuthClient({
  // Points to your Better Auth API route.
  // All auth operations (sign in, sign up, sign out, get session)
  // go through this base URL.
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000",
});

// Export individual methods for convenience so you can import them directly:
//   import { signIn, signOut, useSession } from "@/lib/auth-client"
// instead of:
//   import { authClient } from "@/lib/auth-client"
//   authClient.signIn(...)
export const { signIn, signOut, signUp, useSession } = authClient;
