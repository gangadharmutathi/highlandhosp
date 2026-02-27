"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ViewDoctorProfile from "@/components/molecules/viewdoctorprofile";
import { cn } from "@/lib/utils";

export interface DoctorCardProps {
  id: string;
  imageUrl: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  className?: string;
}

export default function DoctorCard({
  id,
  imageUrl,
  name,
  specialty,
  rating,
  reviewCount,
  className,
}: DoctorCardProps) {
  return (
    <Card
      className={cn(
        "w-full max-w-[380px] overflow-hidden rounded-xl border border-border shadow-sm",
        className,
      )}
    >
      <CardContent className="flex flex-col gap-4 px-5 pt-5 pb-0">
        <div className="flex gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-border-2 bg-muted">
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="truncate text-lg font-bold text-card-foreground">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{specialty}</p>
            <div className="flex items-center gap-1.5 text-sm">
              <Star
                className="size-4 shrink-0 fill-amber-400 text-amber-400"
                aria-hidden
              />
              <span className="font-medium text-card-foreground">{rating}</span>
              <span className="text-muted-foreground">
                ({reviewCount} reviews)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-5 pt-2">
        <ViewDoctorProfile
          doctorID={id}
          className="w-full rounded-lg py-2.5 font-medium"
        />
      </CardFooter>
    </Card>
  );
}
