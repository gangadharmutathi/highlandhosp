// components/molecules/signin-avatar.tsx
//
// Desktop navbar: shows Sign In button OR user name + Sign Out.
//
// This is a SERVER Component — it fetches the session on the server
// so there is no flash of unauthenticated content on page load.
//
// Why server-side session fetch here?
// If we used useSession() (client-side), the navbar would initially
// render the Sign In button, then switch to the user name after
// the client-side session fetch completes — causing a visible flash.
// Fetching on the server means the correct state is rendered immediately.

import { getSession } from "@/lib/actions/auth.actions";
import InteractiveSignInButton from "./interactive-signin-button";
import UserMenu from "./user-menu";

export default async function SignInOrAvatar() {
  // Fetch session server-side — returns null if not logged in
  const session = await getSession();

  // If logged in → show user name and sign out button
  if (session?.user) {
    return <UserMenu name={session.user.name} />;
  }

  // If not logged in → show sign in button
  return (
    <div>
      <InteractiveSignInButton />
    </div>
  );
}
