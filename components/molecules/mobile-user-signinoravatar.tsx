"use client";
// components/molecules/mobile-user-signinoravatar.tsx
//
// Mobile sheet footer: shows Sign In button OR user name + Sign Out.
//
// Why useSession() here instead of server-side fetch?
// This component is inside the mobile Sheet which is a Client Component
// (it uses useState to manage open/close). Client Components cannot
// directly receive async server data as children in all cases.
//
// useSession() from Better Auth is lightweight — it reads from the
// session cookie that was already set on sign in, so there is
// minimal latency. The mobile menu is only opened by user interaction
// so a brief loading state is acceptable here.

import { useSession } from "@/lib/auth-client";
import InteractiveSignInButton from "./interactive-signin-button";
import UserMenu from "./user-menu";

interface MobileUserMenuProps {
  onMobileActionComplete: () => void;
}

export function MobileUserSignInOrAvatar({
  onMobileActionComplete,
}: MobileUserMenuProps) {
  // useSession() returns { data: session, isPending, error }
  // data is null when not logged in, or contains { user, session } when logged in
  const { data: session, isPending } = useSession();

  // Show nothing while session is loading to avoid flash
  if (isPending) return null;

  // If logged in → show user profile dropdown; onSignOut closes the mobile sheet
  if (session?.user) {
    const user = session.user as { id: string; name: string; image?: string | null };
    return (
      <UserMenu
        name={user.name}
        userId={user.id}
        image={user.image ?? null}
        onSignOut={onMobileActionComplete}
      />
    );
  }

  // If not logged in → show sign in button
  // onNavigate closes the mobile sheet when navigating to sign in
  return <InteractiveSignInButton onNavigate={onMobileActionComplete} />;
}

export default MobileUserSignInOrAvatar;
