// components/molecules/menu-client.tsx
//
// Client wrapper for header right section: desktop nav + mobile hamburger sheet.
// Desktop: theme toggle, Home link, Book Appointment button, and the user section
// (SignInOrAvatar → when logged in, User Profile dropdown with name + avatar).
// Mobile: hamburger opens a sheet with the same links + user section in the footer.
// We use a client component here for sheet open state and theme toggle interactivity.

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/molecules/theme-toggle";
import SignInOrAvatar from "@/components/molecules/signin-avatar";
import { MobileUserSignInOrAvatar } from "@/components/molecules/mobile-user-signinoravatar";

interface MenuClientProps {
  /** Renders the desktop user section: either Sign In button or User Profile dropdown (name + avatar) */
  desktopAvatar: React.ReactNode;
}

export function MenuClient({ desktopAvatar }: MenuClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeMobileMenu = () => setSheetOpen(false);
  const handleSheetCloseAutoFocus = (event: Event) => {
    event.preventDefault();
  };

  return (
    <>
      {/* Desktop: theme, Book Appointment, Sign in */}
      <div className="hidden md:flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/"
          className="flex items-center gap-2 text-text-body hover:text-text-primary transition-colors"
          aria-label="Home"
        >
          {/* <Sun className="size-5" /> */}
          <span className="text-sm font-medium">Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="brand" size="default" asChild>
            <Link href="/#our-doctors">Book Appointment</Link>
          </Button>
          {desktopAvatar}
        </div>
      </div>

      {/* Mobile: hamburger menu opening side sheet */}
      <div className="flex md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-text-body hover:text-text-title"
              onClick={() => setSheetOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex w-[280px] flex-col sm:w-[320px] bg-background-2"
            onCloseAutoFocus={handleSheetCloseAutoFocus}
          >
            <SheetHeader>
              <SheetTitle className="text-center border-b border-border-3">
                Menu
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-4 mt-6">
              <ThemeToggle />
              <Link
                href="/"
                className="flex items-center gap-2 text-text-body hover:text-text-title transition-colors py-2"
                onClick={closeMobileMenu}
              >
                <span className="text-sm font-medium py-3">Home</span>
              </Link>
              <Link
                href="/#our-doctors"
                onClick={closeMobileMenu}
                className="w-full"
              >
                <Button variant="brand" size="default" className="w-full">
                  Book Appointment
                </Button>
              </Link>
            </nav>
            <SheetFooter className="mt-auto mx-auto flex-col gap-2 sm:flex-row">
              <MobileUserSignInOrAvatar
                onMobileActionComplete={closeMobileMenu}
              />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
