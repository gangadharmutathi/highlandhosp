// lib/auth.ts
//
// Better Auth server configuration.
// This is the central auth file — everything auth-related on the server
// flows through here.
//
// What this file does:
//   1. Connects Better Auth to your Prisma database
//   2. Configures Email/Password sign in and sign up
//   3. Configures Google OAuth
//   4. Extends the session to include role and isRootAdmin from your User model
//      so middleware can make routing decisions without a DB query
//
// This file is SERVER ONLY — never import it in client components.
// For client components, use lib/auth-client.ts instead.

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/db/prisma";

export const auth = betterAuth({
  // ── Database ──────────────────────────────────────────────────────────────
  // Connect Better Auth to your Prisma client.
  // Better Auth will use the Session and Verification tables we added
  // to the schema, and the existing User and Account tables.
  //
  // Why no schema override here?
  // Better Auth's Prisma adapter reads the generated Prisma client directly.
  // Our User.emailVerified is now Boolean (changed from DateTime) which
  // matches what Better Auth writes internally (false on sign up).
  // No manual field mapping is needed.
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  advanced: {
    database: {
      // Tell Better Auth to generate proper UUID v4 values.
      // Your User.id column is @db.Uuid in PostgreSQL which requires
      // valid UUID format. Better Auth's default random string IDs
      // are rejected by PostgreSQL's uuid type constraint.
      generateId: "uuid",
    },
  },
  // ── App URL ───────────────────────────────────────────────────────────────
  baseURL: process.env.BETTER_AUTH_URL,

  // ── Email & Password ──────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },

  // ── Social Providers ──────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET as string,
    },
  },

  // ── Session ───────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // 1 day in seconds
  },

  // ── User Model Configuration ───────────────────────────────────────────────
  // We declare custom fields that exist on your User model but are not part
  // of Better Auth's default user schema.
  //
  // NOTE: emailVerified is intentionally NOT listed here.
  // Better Auth handles emailVerified internally as a boolean.
  // Our schema now stores it as Boolean @default(false) which matches
  // exactly what Better Auth writes — no override needed.
  //
  // The fields below (role, isRootAdmin, phoneNumber) are custom fields
  // that Better Auth needs to know about so it can:
  //   1. Include them in session data for middleware role checks
  //   2. Accept phoneNumber input during sign up
  user: {
    additionalFields: {
      // Role controls route access in proxy.ts (middleware).
      // Defaults to PATIENT — doctors and admins are created by admin only.
      // input: false means users cannot set their own role during sign up.
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

      // Collected optionally during sign up.
      // input: true allows the patient to provide this when registering.
      phoneNumber: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
});

// Export the auth type for use in other files.
// This gives you full TypeScript type safety when working with sessions.
export type Auth = typeof auth;
