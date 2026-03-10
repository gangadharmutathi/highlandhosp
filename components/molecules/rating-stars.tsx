// components/molecules/rating-stars.tsx

export interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RatingStars({
  rating,
  reviewCount,
  showCount = true,
  size = "md",
}: RatingStarsProps) {
  const clampedRating = Math.min(5, Math.max(0, rating));
  const fullStars = Math.floor(clampedRating);
  const partial = clampedRating - fullStars;
  const emptyStars = 5 - fullStars - (partial > 0 ? 1 : 0);

  const sizeClass = {
    sm: "size-3.5",
    md: "size-5",
    lg: "size-6",
  }[size];

  const textClass = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  return (
    <div className="flex items-center gap-1.5">
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <StarIcon
          key={`full-${i}`}
          fill={1}
          className={sizeClass}
          clipId={`star-full-${i}`}
        />
      ))}

      {/* Partial star */}
      {partial > 0 && (
        <StarIcon
          key="partial"
          fill={partial}
          className={sizeClass}
          clipId="star-partial"
        />
      )}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <StarIcon
          key={`empty-${i}`}
          fill={0}
          className={sizeClass}
          clipId={`star-empty-${i}`}
        />
      ))}

      {/* Rating number and review count */}
      <span className={`font-semibold text-foreground ${textClass}`}>
        {clampedRating.toFixed(1)}
      </span>
      {showCount && reviewCount !== undefined && (
        <span className={`text-muted-foreground ${textClass}`}>
          ({reviewCount} reviews)
        </span>
      )}
    </div>
  );
}

// Internal SVG star that supports partial fill via clipPath
function StarIcon({
  fill,
  className,
  clipId,
}: {
  fill: number; // 0 to 1
  className?: string;
  clipId: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={`${fill * 100}%`} height="100%" />
        </clipPath>
      </defs>
      {/* Empty star (gray background) */}
      <path
        d="M10 1l2.39 4.84 5.34.78-3.86 3.77.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.27 6.62l5.34-.78z"
        fill="#e5e7eb"
      />
      {/* Filled star (amber, clipped to fill %) */}
      <path
        d="M10 1l2.39 4.84 5.34.78-3.86 3.77.91 5.32L10 13.27l-4.78 2.51.91-5.32L2.27 6.62l5.34-.78z"
        fill="#f59e0b"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  );
}
