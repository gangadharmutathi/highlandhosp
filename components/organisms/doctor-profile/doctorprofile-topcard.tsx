// components/doctors/doctorprofile/doctorprofile-topcard.tsx

import Image from "next/image";
import { DoctorDetails } from "@/types";
import RatingStars from "@/components/molecules/rating-stars";
import { Card, CardContent } from "@/components/ui/card";

export default function DoctorProfileTopCard({
  name,
  credentials,
  languages,
  specializations,
  specialty,
  rating,
  reviewCount,
  imageUrl,
}: DoctorDetails) {
  return (
    <Card className="w-full overflow-hidden rounded-2xl border-0 bg-background shadow-sm p-4 md:p-6">
      <CardContent className="p-0 flex flex-col md:flex-row md:gap-6 gap-5">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Doctor Image */}
          <div className="relative mx-auto h-52 w-52 shrink-0 overflow-hidden rounded-xl sm:mx-0 sm:h-56 sm:w-72 bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vh, 288px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground text-4xl font-bold">
                {name?.charAt(0).toUpperCase() ?? "D"}
              </div>
            )}
          </div>

          {/* Doctor Info */}
          <div className="flex flex-1 flex-col justify-center gap-4">
            {/* Name & Specialty */}
            <div>
              <h2 className="text-text-title">
                {name}
                {credentials && (
                  <span className="text-xl font-semibold">, {credentials}</span>
                )}
              </h2>
              <h4 className="text-text-body-subtle">{specialty}</h4>
            </div>

            {/* Rating */}
            <RatingStars
              rating={rating}
              reviewCount={reviewCount}
              showCount={true}
              size="md"
            />

            {/* Languages */}
            {languages && languages.length > 0 && (
              <InfoBox label="Languages" value={languages.join(", ")} />
            )}

            {/* Specialisations */}
            {specializations && specializations.length > 0 && (
              <InfoBox
                label="Specialisation"
                value={specializations.join(", ")}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Small reusable info box matching the screenshot style
function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
