// components/organisms/doctor-profile/doctor-profile-review-section.tsx

import { Card, CardContent } from "@/components/ui/card";
import { getDoctorReviewsPaginated } from "@/lib/actions/review.actions";
import { PAGE_SIZE } from "@/lib/constants";
import ReviewSummaryHeader from "@/components/organisms/doctor-profile/review-summary-header";
import ReviewCard from "@/components/organisms/doctor-profile/review-card";
import ReviewPagination from "@/components/organisms/doctor-profile/review-pagination";

interface DoctorProfileReviewSectionProps {
  doctorId: string;
  rating: number;
  currentPage: number;
}

export default async function DoctorProfileReviewSection({
  doctorId,
  rating,
  currentPage,
}: DoctorProfileReviewSectionProps) {
  console.log("DoctorProfileReviewSection doctorId:", doctorId);
  const response = await getDoctorReviewsPaginated(
    doctorId,
    currentPage,
    PAGE_SIZE,
  );

  if (!response.success || !response.data) {
    return (
      <Card className="w-full overflow-hidden rounded-2xl border-0 bg-background shadow-sm p-4 md:p-6">
        <CardContent className="p-0">
          <p className="text-sm text-muted-foreground">
            No reviews available yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { reviews, totalPages, totalReviews } = response.data;

  // Showing X-Y of Z
  const start = (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalReviews);

  return (
    <Card className="w-full overflow-hidden rounded-2xl border-0 bg-background shadow-sm p-4 md:p-6">
      <CardContent className="p-0 flex flex-col gap-4">
        {/* Header: "Patient Reviews" + aggregate rating */}
        <ReviewSummaryHeader rating={rating} totalReviews={totalReviews} />

        {/* Showing X-Y of Z reviews */}
        <p className="text-sm text-muted-foreground">
          Showing {start}-{end} of {totalReviews} reviews
        </p>

        {/* Review list */}
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No reviews on this page.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {reviews.map((review) => (
              <ReviewCard key={review.id} {...review} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <ReviewPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalReviews={totalReviews}
          pageSize={PAGE_SIZE}
        />
      </CardContent>
    </Card>
  );
}
