// lib/auth.ts
//
// Better Auth server configuration.
// This is the central auth file — everything auth-related on the server
// flows through here.
//
// What this file does:
//   1. Connects Better Auth to your Prisma database
//   2. Configures Email/Password sign in and sign up
//   3. Extends the session to include role and isRootAdmin from your User model
//      so middleware can make routing decisions without a DB query
//
// This file is SERVER ONLY — never import it in client components.
// For client components, use lib/auth-client.ts instead.
//
// NOTE: Google OAuth is parked for now. Email/password authentication is
// fully working. Google OAuth can be revisited when deploying to production
// with proper redirect URIs configured in Google Cloud Console.

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/db/prisma";

export const auth = betterAuth({
  // ── Trusted Origins ───────────────────────────────────────────────────────
  // Explicitly trust our local development origin.
  // Required for Better Auth to accept requests from the browser.
  trustedOrigins: [
    "http://localhost:3000",
    "https://highlandclinic.vercel.app",
  ],

  // ── Database ──────────────────────────────────────────────────────────────
  // Connect Better Auth to your Prisma client.
  // Better Auth will use the Session and Verification tables we added
  // to the schema, and the existing User and Account tables.
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ── Advanced ──────────────────────────────────────────────────────────────
  advanced: {
    database: {
      // Tell Better Auth to generate proper UUID v4 values for all IDs.
      // User.id is @db.Uuid in PostgreSQL which requires valid UUID format.
      // Better Auth's default random string IDs are rejected by PostgreSQL's
      // uuid type constraint without this setting.
      generateId: "uuid",
    },
  },

  // ── App URL ───────────────────────────────────────────────────────────────
  // Used by Better Auth to construct callback URLs.
  // Reads from BETTER_AUTH_URL in your .env file.
  baseURL: process.env.BETTER_AUTH_URL,

  // ── Email & Password ──────────────────────────────────────────────────────
  // Enables the standard email + password sign in and sign up flow.
  // Better Auth handles password hashing automatically using bcrypt.
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },

  // ── Session ───────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // refresh expiry after 1 day of activity
  },

  // ── User Model Configuration ───────────────────────────────────────────────
  // Declare custom fields on the User model that Better Auth needs to know
  // about so they are included in session data and available in middleware.
  //
  // NOTE: emailVerified is intentionally NOT listed here.
  // Better Auth handles it internally as Boolean @default(false) which
  // matches our schema exactly — no override needed.
  user: {
    additionalFields: {
      // Role controls route access in proxy.ts (middleware).
      // Defaults to PATIENT — doctors and admins are created by admin only.
      // input: false prevents users from setting their own role during sign up.
      role: {
        type: "string",
        required: false,
        defaultValue: "PATIENT",
        input: false,
      },

      // isRootAdmin grants highest level admin access.
      // Only ever set directly in the database — never via sign up.
      isRootAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },

      // Phone number collected optionally during sign up.
      phoneNumber: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});

// Export the auth type for use in other files.
// This gives full TypeScript type safety when working with sessions.
export type Auth = typeof auth;
