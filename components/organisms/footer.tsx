import { Phone, Mail, MapPin } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MOTTO = "Excellence in Healthcare, Committed to Your Well-being";
const PHONE = "(555) 123-4567";
const EMAIL = "info@highland.med";
const ADDRESS = "123 Medical Center Dr, Highland, CA 92346";
const COPYRIGHT = `© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.`;

const footerMuted = "text-text-caption-1";

function ContactItem({
  icon: Icon,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className={cn("size-4 shrink-0", footerMuted)} />
      <span className={cn("text-sm", footerMuted)}>{children}</span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      className="w-full bg-background-4 px-6 py-10 md:px-8 md:py-12"
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Top: Branding (left) + Contact (right) */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-text-caption-2">
              {APP_NAME}
            </h2>
            <p className={cn("max-w-sm text-sm", footerMuted)}>{MOTTO}</p>
          </div>
          <div className="space-y-4 md:flex md:flex-col md:items-start">
            <h3 className="text-lg font-semibold text-text-caption-2">
              Contact Us
            </h3>
            <div className="flex flex-col gap-3 md:items-start">
              <ContactItem icon={Phone}>{PHONE}</ContactItem>
              <ContactItem icon={Mail}>{EMAIL}</ContactItem>
              <ContactItem icon={MapPin}>{ADDRESS}</ContactItem>
            </div>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="mt-12 pt-8">
          <p className={cn("text-center text-sm", footerMuted)}>{COPYRIGHT}</p>
        </div>
      </div>
    </footer>
  );
}
