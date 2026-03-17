// components/ui/avatar.tsx
//
// shadcn-style wrapper around Radix UI Avatar primitives.
//
// Purpose:
// - Provide a consistent Avatar API (`Avatar`, `AvatarImage`, `AvatarFallback`)
//   across the app with Tailwind styling baked in.
// - Keep page/components code clean (no repeated class strings).
//
// Used by:
// - `/user/[id]` profile header (patient photo + initials fallback).

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

function Avatar(props: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  const { className, ...rest } = props;
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...rest}
    />
  );
}

function AvatarImage(
  props: React.ComponentProps<typeof AvatarPrimitive.Image>,
) {
  const { className, ...rest } = props;
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...rest}
    />
  );
}

function AvatarFallback(
  props: React.ComponentProps<typeof AvatarPrimitive.Fallback>,
) {
  const { className, ...rest } = props;
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground",
        className,
      )}
      {...rest}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
