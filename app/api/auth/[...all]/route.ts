// app/api/auth/[...all]/route.ts
//
// Better Auth API route handler.
// This single file handles ALL auth-related HTTP requests:
//   POST /api/auth/sign-in
//   POST /api/auth/sign-up
//   POST /api/auth/sign-out
//   GET  /api/auth/session
//   GET  /api/auth/callback/google   ← OAuth callback
//   ... and all other Better Auth endpoints
//
// The [...all] catch-all segment means any request to /api/auth/*
// is routed here and handled by Better Auth automatically.
// You never need to write individual route handlers for auth operations.

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// toNextJsHandler converts Better Auth's handler into Next.js
// App Router compatible GET and POST exports
export const { GET, POST } = toNextJsHandler(auth);
