"use client";

import DoctorCard from "@/components/molecules/doctorcard";
import ReviewCard from "@/components/molecules/reviewcard";
import DepartmentSections from "@/components/organisms/our-department";

const sampleDoctor = {
  id: "1",
  imageUrl: "/file.svg",
  name: "Dr. Sarah Mitchell",
  specialty: "Cardiology",
  rating: 4.9,
  reviewCount: 127,
};

const sampleReviews = [
  {
    id: "1",
    reviewerName: "Michael Thompson",
    avatarUrl: "/file.svg",
    rating: 5,
    feedback:
      "Outstanding service! The booking process was seamless, and Dr. Mitchell provided excellent care.",
    date: "March 15, 2025",
  },
  {
    id: "2",
    reviewerName: "Sarah Chen",
    avatarUrl: "/file.svg",
    rating: 5,
    feedback:
      "Very professional and caring. The clinic is clean and the staff made me feel comfortable throughout my visit. I would definitely recommend to others.",
    date: "March 10, 2025",
  },
];

export default function ExamplesPage() {
  return (
    <div className="flex flex-col items-center gap-4 w-full min-h-screen py-10">
      <div className="flex flex-col w-full max-w-[380px] justify-center items-center gap-6 px-4">
        <DoctorCard
          id={sampleDoctor.id}
          imageUrl={sampleDoctor.imageUrl}
          name={sampleDoctor.name}
          specialty={sampleDoctor.specialty}
          rating={sampleDoctor.rating}
          reviewCount={sampleDoctor.reviewCount}
        />
      </div>
      <div className="flex w-full flex-col justify-center mx-auto gap-4">
        <div className="flex w-full flex-col-3 gap-4">
          {sampleReviews.map((review) => (
            <ReviewCard
              key={review.id}
              id={review.id}
              reviewerName={review.reviewerName}
              avatarUrl={review.avatarUrl}
              rating={review.rating}
              feedback={review.feedback}
              date={review.date}
            />
          ))}
        </div>
      </div>
      <DepartmentSections />
    </div>
  );
}
