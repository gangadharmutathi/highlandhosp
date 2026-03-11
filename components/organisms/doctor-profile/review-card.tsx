// components/organisms/doctor-profile/review-card.tsx

import { DoctorReviews } from "@/types";
import RatingStars from "@/components/molecules/rating-stars";

export default function ReviewCard({
  patientName,
  rating,
  testimonialText,
  reviewDate,
}: DoctorReviews) {
  // Extract month and year from reviewDate e.g. "09 Mar 2025 at 14:30" -> "March 2025"
  const formattedDate = reviewDate
    ? reviewDate
        .split(" at ")[0] // Takes "09 Mar 2025" from "09 Mar 2025 at 14:30"
        .split(" ")
        .slice(1) // Remove day number, keep "Mar 2025"
        .join(" ")
    : null;

  return (
    <div className="flex flex-col gap-2 py-4">
      {/* Stars + Date */}
      <div className="flex items-center gap-3">
        <RatingStars rating={rating ?? 0} showCount={false} size="sm" />
        {formattedDate && (
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        )}
      </div>

      {/* Review Text */}
      {testimonialText && (
        <p className="text-sm text-foreground leading-relaxed">
          &quot;{testimonialText}&quot;
        </p>
      )}

      {/* Patient Name */}
      {patientName && (
        <p className="text-sm text-muted-foreground">- {patientName}</p>
      )}
    </div>
  );
}
