import React from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

import { PlusIcon } from "@heroicons/react/24/outline";
import { MenuClient } from "@/components/molecules/menu-client";
import SignInOrAvatar from "@/components/molecules/signin-avatar";

const Header = () => {
  return (
    <header className="flex items-center w-full max-w-[1440px] mx-auto justify-between px-6 py-4 bg-background-2 sticky top-0 z-50">
      {/* Left Section: Logo */}
      <Link href="/">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-sm">
            <PlusIcon className="text-white w-5 h-5" strokeWidth={3} />
          </div>
          <h3 className="hidden lg:block">{APP_NAME}</h3>
        </div>
      </Link>
      {/* Right Section: Menu (desktop nav + mobile hamburger) */}
      <MenuClient desktopAvatar={<SignInOrAvatar />} />
    </header>
  );
};

export default Header;
