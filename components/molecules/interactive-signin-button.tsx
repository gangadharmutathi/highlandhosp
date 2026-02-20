"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
interface InteractiveSignInButtonProps {
  onNavigate?: () => void;
  className?: string;
}

export default function InteractiveSignInButton({
  onNavigate,
  className,
}: InteractiveSignInButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      router.push("/sign-in");
      if (onNavigate) {
        onNavigate();
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="default"
      onClick={handleClick}
      disabled={isPending}
      aria-busy={isPending}
      className={className}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          <span>Signing in...</span>
        </>
      ) : (
        "Sign in"
      )}
    </Button>
  );
}
