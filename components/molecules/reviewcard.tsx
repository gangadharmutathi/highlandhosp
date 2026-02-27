"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ReviewCardProps {
  /** Optional id for Supabase record */
  id?: string;
  reviewerName: string;
  avatarUrl: string;
  rating: number;
  feedback: string;
  /** Display date, e.g. "March 15, 2025" or ISO string */
  date: string;
  className?: string;
}

const MAX_STARS = 5;

export default function ReviewCard({
  reviewerName,
  avatarUrl,
  rating,
  feedback,
  date,
  className,
}: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  /** Show "more…" when feedback is long enough to exceed ~3 lines */
  const needsExpand = feedback.length > 140;

  return (
    <Card
      className={cn(
        "w-full flex flex-col max-w-sm overflow-hidden p-6 gap-4 rounded-xl border border-border bg-background",
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border-2 bg-muted">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={reviewerName}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex items-center justify-center size-12 shrink-0 overflow-hidden rounded-full border border-border-2 bg-muted">
                <span> {reviewerName.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate font-bold text-card-foreground">
              {reviewerName}
            </p>
            <div
              className="flex items-center gap-0.5"
              aria-label={`${rating} out of ${MAX_STARS} stars`}
            >
              {Array.from({ length: MAX_STARS }, (_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "size-4 shrink-0",
                    i < rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-transparent text-muted-foreground/30",
                  )}
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-5 py-5">
        <div className="space-y-1">
          <p
            className={cn(
              "text-sm text-card-foreground",
              !expanded && "line-clamp-3",
            )}
          >
            &ldquo;{feedback}&rdquo;
          </p>
          {needsExpand && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="text-sm font-medium text-primary hover:underline focus:outline-none focus:underline"
            >
              {expanded ? "less…" : "more…"}
            </button>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">{date}</p>
      </CardFooter>
    </Card>
  );
}
