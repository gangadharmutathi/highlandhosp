// components/molecules/signin-avatar.tsx
//
// Desktop navbar: shows Sign In button OR the User Profile dropdown (name + avatar).
//
// This is a SERVER Component — it fetches the session on the server
// so there is no flash of unauthenticated content on page load.
//
// Why server-side session fetch here?
// If we used useSession() (client-side), the navbar would initially
// render the Sign In button, then switch to the user section after
// the client-side session fetch completes — causing a visible flash.
// Fetching on the server means the correct state is rendered immediately.
//
// When logged in we pass user id (for /user/[id] profile link), name, and
// optional image (e.g. from OAuth) to UserMenu so the dropdown can show
// the avatar and navigate to the correct profile page.

import { getSession } from "@/lib/actions/auth.actions";
import InteractiveSignInButton from "./interactive-signin-button";
import UserMenu from "./user-menu";

export default async function SignInOrAvatar() {
  // Fetch session server-side — returns null if not logged in
  const session = await getSession();

  // If logged in → show user profile dropdown (name + avatar, menu with profile + sign out)
  if (session?.user) {
    const user = session.user as { id: string; name: string; image?: string | null };
    return (
      <UserMenu
        name={user.name}
        userId={user.id}
        image={user.image ?? null}
      />
    );
  }

  // If not logged in → show sign in button
  return (
    <div>
      <InteractiveSignInButton />
    </div>
  );
}
