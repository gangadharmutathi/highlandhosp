// components/molecules/user-menu.tsx
//
// Shown in the navbar when the user IS signed in.
// Renders a User Profile dropdown: [Name] [Avatar] as trigger, with menu options
// "Appointments and Profile" (→ /user/[id]) and "Sign Out".
//
// This is a Client Component because:
//   - It uses DropdownMenu (open state, hover + click)
//   - It calls signOut() from Better Auth (client-side API)
//   - It uses useRouter for navigation and redirect after sign out
//
// Used by: desktop (SignInOrAvatar) and mobile (MobileUserSignInOrAvatar).
// Pass userId so the profile link targets the correct /user/[id] route.

"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  /** User's display name — shown next to the avatar in the header */
  name: string;
  /** User id from auth session — used for the profile link /user/[id] */
  userId: string;
  /** Optional profile image URL from session (e.g. OAuth) — shown in Avatar when present */
  image?: string | null;
  /** Optional callback after sign out — e.g. close the mobile sheet */
  onSignOut?: () => void;
}

/** First letter of name for Avatar fallback when no image (e.g. "F" for "Farun") */
function getInitial(name: string): string {
  const trimmed = name?.trim() || "";
  return trimmed.charAt(0).toUpperCase() || "U";
}

export default function UserMenu({
  name,
  userId,
  image,
  onSignOut,
}: UserMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearCloseTimeout();
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  const handleOpenChange = (next: boolean) => {
    clearCloseTimeout();
    setOpen(next);
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut();
      if (onSignOut) onSignOut();
      setOpen(false);
      router.push("/");
      router.refresh();
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      {/* Trigger: name (left) + avatar (right). Hover or click opens the menu. */}
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-1 py-1.5 text-text-body outline-none hover:bg-accent/50 hover:text-text-title focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="User menu"
        >
          <span className="max-w-[120px] truncate text-sm font-medium">
            {name}
          </span>
          <Avatar className="size-8 shrink-0 border border-border-2">
            {image ? (
              <AvatarImage src={image} alt={name} />
            ) : null}
            <AvatarFallback className="text-xs font-medium text-muted-foreground">
              {getInitial(name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      {/* Menu content: right-aligned to the trigger; hover over content keeps it open */}
      <DropdownMenuContent
        align="end"
        className="min-w-[200px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenuItem asChild>
          <Link
            href={`/user/${userId}`}
            className="flex cursor-pointer items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <CalendarDays className="size-4" />
            Appointments and Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="cursor-pointer focus:bg-destructive/10 focus:text-destructive"
          aria-busy={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="size-4" aria-hidden />
              Sign Out
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
