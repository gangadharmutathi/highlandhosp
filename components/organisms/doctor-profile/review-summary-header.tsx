// components/organisms/doctor-profile/review-summary-header.tsx

import RatingStars from "@/components/molecules/rating-stars";

interface ReviewSummaryHeaderProps {
  rating: number;
  totalReviews: number;
}

export default function ReviewSummaryHeader({
  rating,
  totalReviews,
}: ReviewSummaryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Left: Section Title */}
      <h3 className="text-lg font-bold text-foreground">Patient Reviews</h3>

      {/* Right: Aggregate Rating */}
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-foreground">
          {rating.toFixed(1)}
        </span>
        <div className="flex flex-col gap-0.5">
          <RatingStars rating={rating} showCount={false} size="md" />
          <span className="text-xs text-muted-foreground">
            {totalReviews} reviews
          </span>
        </div>
      </div>
    </div>
  );
}
