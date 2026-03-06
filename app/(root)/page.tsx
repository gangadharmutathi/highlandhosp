import DepartmentSections from "@/components/organisms/our-department";
import OurDoctors from "@/components/organisms/our-doctors";
import PatientTestimonialsSection from "@/components/organisms/patient-testimonials-section";
import HomeBanner from "@/components/organisms/home-banner";
import { Suspense } from "react";

export default function Home() {
  return (
    <div>
      <div>
        <HomeBanner />
      </div>

      <div className="flex flex-col  max-w-7xl p-8 mx-auto gap-12">
        <p className="mx-auto max-w-3xl body-regular text-text-subtle text-center mt-4">
          Welcome to Highland Medical Center, your premier destination for
          specialized healthcare consultation. Our facility brings together
          exceptional physicians across all major medical departments, offering
          expert diagnosis and personalized treatment planning in one convenient
          location.
        </p>
        <Suspense fallback={<p>Loading Departments...</p>}>
          <DepartmentSections />
        </Suspense>
      </div>
      <div id="our-doctors">
        <OurDoctors />
      </div>
      <PatientTestimonialsSection />
    </div>
  );
}
