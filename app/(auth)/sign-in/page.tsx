// app/(auth)/sign-in/page.tsx
//
// Sign in page — thin wrapper around the SignInForm component.
//
// Why keep this file so minimal?
// All the form logic lives in SignInForm (client component).
// This page just renders the form and handles the ?registered=true
// query param that sign-up redirects to — showing a success message
// so the user knows their account was created and they can now sign in.

import { Suspense } from "react";
import SignInForm from "@/components/organisms/auth/sign-in-form";
import SignInMessage from "@/components/organisms/auth/sign-in-message";

export default function SignInPage() {
  return (
    <>
      {/*
        Suspense is required here because SignInMessage uses useSearchParams()
        which needs to be wrapped in Suspense in Next.js App Router.
        Without it, the build will fail with a useSearchParams() error.
      */}
      <Suspense fallback={null}>
        <SignInMessage />
      </Suspense>
      {/* SignInForm also needs Suspense because it uses useSearchParams() */}
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </>
  );
}
