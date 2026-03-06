import DoctorCard from "@/components/molecules/doctorcard";
import { getOurDoctors } from "@/lib/actions/doctor.actions";
import { DoctorSummary } from "@/types";

export default async function OurDoctors() {
  // 1. Fetch live data from Supabase
  const response = await getOurDoctors();

  // 2. Handle error states
  if (!response.success || !response.data) {
    return (
      <section className="w-full py-8">
        <p className="text-center text-red-500">
          {response.error || "Failed to load doctors."}
        </p>
      </section>
    );
  }

  const doctorCards: DoctorSummary[] = response.data;

  return (
    <section className="w-full py-12 bg-background-soft">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center text-text-title text-3xl font-bold tracking-tight">
          Meet Our Specialists
        </h2>

        <div className="flex flex-wrap justify-center gap-6 md:gap-10">
          {doctorCards.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              // Now we pass the properties explicitly without 'any'
              id={doctor.id ?? ""}
              name={doctor.name ?? "Doctor"}
              specialty={doctor.specialty ?? "Specialist"}
              rating={doctor.rating ?? 0}
              reviewCount={doctor.reviewCount ?? 0}
              imageUrl={doctor.imageUrl ?? ""}
              className="w-full sm:w-[280px] h-auto"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
