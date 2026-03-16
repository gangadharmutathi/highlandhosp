"use server";
// lib/actions/auth.actions.ts
//
// Server actions for authentication.
//
// Why do we need this file if Better Auth handles auth automatically?
// Better Auth handles sign IN and sign OUT automatically via its API routes.
// But sign UP for our app has custom business logic:
//   - New users must always be created as PATIENT role
//   - Doctors and Admins are created by admins only — never via self-registration
//   - We need to enforce this on the server, not just the UI
//
// If we let the client call Better Auth's sign up directly, a clever user
// could manipulate the request to set their role to ADMIN. This server action
// acts as a controlled gateway that always enforces PATIENT role on sign up.

import { auth } from "@/lib/auth";
import { ServerActionResponse } from "@/types";
import { APIError } from "better-auth/api";

// ─────────────────────────────────────────────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new PATIENT account.
 *
 * Called from the SignUpForm component when the patient submits the form.
 *
 * Better Auth handles:
 *   - Password hashing (bcrypt internally)
 *   - Creating the User row
 *   - Creating the Session row
 *   - Setting the session cookie
 *
 * We handle:
 *   - Ensuring role is always PATIENT (cannot be overridden by client)
 *   - Returning a typed ServerActionResponse for consistent error handling
 *
 * Parameters:
 *   name     — patient's full name
 *   email    — must be unique (Better Auth enforces this)
 *   password — min 8 characters (enforced in lib/auth.ts)
 */
export async function signUpAction(
  name: string,
  email: string,
  password: string,
): Promise<ServerActionResponse> {
  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        // role and isRootAdmin are set to their defaults (PATIENT, false)
        // in lib/auth.ts additionalFields with input: false —
        // meaning they cannot be passed in from the client side.
        // We do not need to set them here explicitly.
      },
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error) {
    // Better Auth throws APIError for known errors like duplicate email.
    // We catch these and return user-friendly messages.
    if (error instanceof APIError) {
      switch (error.status) {
        case "UNPROCESSABLE_ENTITY":
          return {
            success: false,
            error: "An account with this email already exists.",
            errorType: "EMAIL_EXISTS",
          };
        case "BAD_REQUEST":
          return {
            success: false,
            error: "Invalid email or password format.",
            errorType: "VALIDATION_ERROR",
          };
        default:
          return {
            success: false,
            error: "Failed to create account. Please try again.",
            errorType: String(error.status),
          };
      }
    }

    // Unknown error — log it server-side but return a generic message
    // to the client (never expose internal errors to users)
    console.error("[signUpAction] Unexpected error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET SESSION (Server Side)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the current session on the server side.
 *
 * Used in Server Components and Server Actions where you need to know
 * who is logged in. For example, in page.tsx to personalise content
 * or to get the current user's ID for database queries.
 *
 * For Client Components, use useSession() from lib/auth-client.ts instead.
 *
 * Usage in a Server Component:
 *   const session = await getSession();
 *   if (!session) redirect("/sign-in");
 *   const userId = session.user.id;
 */
export async function getSession() {
  try {
    const session = await auth.api.getSession({
      // In server actions we need to pass the request headers
      // so Better Auth can read the session cookie.
      // headers() is a Next.js function that returns the current request headers.
      headers: await import("next/headers").then((m) => m.headers()),
    });
    return session;
  } catch {
    // If session fetch fails (e.g. invalid/expired cookie), return null
    // The calling code should handle null as "not logged in"
    return null;
  }
}
