"use client";
// components/organisms/auth/sign-in-form.tsx
//
// The sign in form component.
// Handles both Email/Password and Google OAuth sign in.
//
// This is a Client Component because it:
//   - Manages form state (email, password, errors, loading)
//   - Calls Better Auth client methods directly
//   - Uses the useRouter hook for redirect after sign in
//
// Data flow:
//   User fills form → calls signIn.email() from auth-client
//   Better Auth sends POST to /api/auth/sign-in
//   On success → session cookie set → redirect to callbackUrl or home
//   On error → display error message

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SignInForm() {
  const router = useRouter();

  // searchParams lets us read ?callbackUrl=/appointments from the URL
  // set by middleware when redirecting unauthenticated users
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  // ── Form state ──
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ── Handle Email/Password sign in ──
  async function handleEmailSignIn(e: React.FormEvent) {
    // Prevent default form submission which would reload the page
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn.email({
      email,
      password,
      // callbackURL tells Better Auth where to redirect after sign in
      callbackURL: callbackUrl,
    });

    setIsLoading(false);

    if (result.error) {
      // Map Better Auth error messages to user-friendly text
      if (result.error.code === "INVALID_EMAIL_OR_PASSWORD") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Sign in failed. Please try again.");
      }
      return;
    }

    // Success — Better Auth sets the session cookie automatically
    // Redirect to the intended destination
    router.push(callbackUrl);
    router.refresh(); // refresh server components to reflect new session
  }

  // ── Handle Google OAuth sign in ──
  async function handleGoogleSignIn() {
    setError(null);
    setIsGoogleLoading(true);

    await signIn.social({
      provider: "google",
      // After Google redirects back, Better Auth will redirect here
      callbackURL: callbackUrl,
    });

    // Note: setIsGoogleLoading(false) is not needed here because
    // the page will navigate away to Google's OAuth page
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>
          Sign in to your Highland Medical Center account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Error message ── */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Email/Password form ── */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className={cn(error && "border-red-300")}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/80 text-text-body-regular"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* ── Divider ── */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2">
            or continue with
          </div>
        </div>

        {/* ── Google OAuth button ── */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {/* Google SVG icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </span>
          )}
        </Button>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
