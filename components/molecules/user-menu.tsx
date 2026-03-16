"use client";
// components/molecules/user-menu.tsx
//
// Shown in the navbar when the user IS signed in.
// Displays the user's name and a Sign Out button.
//
// This is a Client Component because:
//   - It calls signOut() from Better Auth which triggers a client-side API call
//   - It uses useRouter to redirect after sign out
//   - It manages isPending state for the loading spinner
//
// Used by both desktop (SignInOrAvatar) and mobile (MobileUserSignInOrAvatar).

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

interface UserMenuProps {
  // The user's display name passed down from the session
  name: string;
  // Optional callback — used by mobile menu to close the sheet after sign out
  onSignOut?: () => void;
}

export default function UserMenu({ name, onSignOut }: UserMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      // signOut() calls Better Auth's sign out API endpoint which:
      //   1. Deletes the session row from the database
      //   2. Clears the session cookie from the browser
      await signOut();

      // Call optional callback e.g. close the mobile sheet
      if (onSignOut) onSignOut();

      // Redirect to home page after sign out
      router.push("/");

      // router.refresh() tells Next.js to re-run all server components
      // on the current page — this causes the navbar to re-render
      // and show the Sign In button instead of the user name
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      {/* User name — truncated if too long */}
      <div className="flex items-center gap-1.5 text-sm text-text-body">
        <User className="size-4 text-primary" />
        <span className="font-medium max-w-[120px] truncate">{name}</span>
      </div>

      {/* Sign Out button */}
      <Button
        variant="outline"
        size="default"
        onClick={handleSignOut}
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            <span>Signing out...</span>
          </>
        ) : (
          <>
            <LogOut className="size-4" aria-hidden />
            <span>Sign Out</span>
          </>
        )}
      </Button>
    </div>
  );
}
