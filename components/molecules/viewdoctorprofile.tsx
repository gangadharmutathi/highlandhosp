"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ViewDoctorProfileProps {
  doctorID: string;
  className?: string;
}

export default function ViewDoctorProfile({
  doctorID,
  className,
}: ViewDoctorProfileProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const targetPath = `/doctors/${doctorID}`;
  const isNavigating = isPending || navigatingTo === targetPath;

  const handleClick = () => {
    setNavigatingTo(targetPath);
    startTransition(() => {
      router.push(targetPath);
    });
  };

  return (
    <Button
      variant="default"
      className={className}
      onClick={handleClick}
      disabled={isNavigating}
      aria-busy={isNavigating}
    >
      {isNavigating ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Loading...
        </>
      ) : (
        "View Profile"
      )}
    </Button>
  );
}
