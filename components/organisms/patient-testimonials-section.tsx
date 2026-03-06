import ReviewCard from "@/components/molecules/reviewcard";
import { getDoctorReviews } from "@/lib/actions/review.actions";
import { DoctorReviews } from "@/types";

export default async function PatientTestimonialsSection() {
  // 1. Fetch real testimonials from Supabase
  const response = await getDoctorReviews();

  // 2. Handle failure or empty data
  if (!response.success || !response.data) {
    return (
      <section className="w-full py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">
            {response.error || "Unable to load patient testimonials."}
          </p>
        </div>
      </section>
    );
  }

  const reviewCards: DoctorReviews[] = response.data;

  return (
    <section className="w-full py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <h2 className="mb-12 text-center text-text-title text-3xl font-bold tracking-tight">
          What Our Patients Say
        </h2>

        {/* Testimonials Container */}
        {reviewCards.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {reviewCards.map((testimonial) => (
              <ReviewCard
                key={testimonial.id}
                reviewerName={testimonial.patientName ?? "Anonymous"}
                avatarUrl={testimonial.patientImage || ""}
                rating={testimonial.rating ?? 0}
                feedback={testimonial.testimonialText ?? ""}
                date={testimonial.reviewDate ?? ""}
                className="w-full sm:w-[350px] h-auto"
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground italic">
            No testimonials found.
          </div>
        )}
      </div>
    </section>
  );
}
