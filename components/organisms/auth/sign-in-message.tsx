"use client";
// components/organisms/auth/sign-in-message.tsx
//
// Shows a success message on the sign in page when the user has just
// registered — redirected from sign-up with ?registered=true in the URL.
//
// This is a separate component (not inside sign-in-form.tsx) because
// useSearchParams() must be wrapped in Suspense, and it is cleaner to
// isolate that requirement in its own small component.

import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export default function SignInMessage() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  // Only render if ?registered=true is in the URL
  if (registered !== "true") return null;

  return (
    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3 mb-4">
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      <span>Account created successfully. Please sign in.</span>
    </div>
  );
}
