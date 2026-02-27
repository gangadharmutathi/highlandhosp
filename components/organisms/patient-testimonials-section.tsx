import ReviewCard from "@/components/molecules/reviewcard"; // Adjust path as needed
import { testimonialData } from "@/db/dummydata";

interface ReviewCardData {
  id: string;
  patientName: string;
  patientImage?: string;
  rating: number;
  testimonialText: string;
  reviewDate: string;
}

export default function PatientTestimonialsSection() {
  const reviewCards: ReviewCardData[] = testimonialData;

  return (
    <section className="w-full py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <h2 className="mb-8 text-center text-text-title tracking-tight">
          Patient Testimonials
        </h2>

        {/* Testimonials Container */}

        {reviewCards.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6">
            {reviewCards.map((testimonial) => (
              <ReviewCard
                key={testimonial.id}
                reviewerName={testimonial.patientName}
                avatarUrl={testimonial.patientImage || ""}
                rating={testimonial.rating}
                feedback={testimonial.testimonialText}
                date={testimonial.reviewDate}
                className="h-auto" // Ensures card height is based on content
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-text-title tracking-tight">
            No testimonials found
          </div>
        )}
      </div>
    </section>
  );
}
