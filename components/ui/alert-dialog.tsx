// components/ui/alert-dialog.tsx
//
// shadcn-style wrapper around Radix UI Alert Dialog primitives.
//
// Why wrap Radix?
// - We centralize styling (Tailwind classes) and keep usage consistent across the app.
// - The rest of the codebase can import ergonomic components like
//   `AlertDialogContent`, `AlertDialogAction`, etc. without repeating boilerplate.
//
// Used by:
// - `/user/[id]` appointment cancellation flow (matches the provided modal UI).

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>,
) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>,
) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>,
) {
  const { className, ...rest } = props
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      {...rest}
    />
  )
}

function AlertDialogContent(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Content>,
) {
  const { className, ...rest } = props
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className,
        )}
        {...rest}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...rest}
    />
  )
}

function AlertDialogFooter(props: React.ComponentProps<"div">) {
  const { className, ...rest } = props
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "mt-6 flex items-center justify-end gap-2",
        "sm:gap-3",
        className,
      )}
      {...rest}
    />
  )
}

function AlertDialogTitle(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Title>,
) {
  const { className, ...rest } = props
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-base font-semibold text-foreground", className)}
      {...rest}
    />
  )
}

function AlertDialogDescription(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Description>,
) {
  const { className, ...rest } = props
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...rest}
    />
  )
}

function AlertDialogAction(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Action>,
) {
  const { className, ...rest } = props
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonVariants({ variant: "default" }), className)}
      {...rest}
    />
  )
}

function AlertDialogCancel(
  props: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>,
) {
  const { className, ...rest } = props
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...rest}
    />
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}

