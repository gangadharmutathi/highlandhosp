"use client";

import InteractiveSignInButton from "./interactive-signin-button";
interface MobileUserMenuProps {
  onMobileActionComplete: () => void;
}

export function MobileUserSignInOrAvatar({
  onMobileActionComplete,
}: MobileUserMenuProps) {
  return (
    <div>
      <InteractiveSignInButton onNavigate={onMobileActionComplete} />
    </div>
  );
}

export default MobileUserSignInOrAvatar;
