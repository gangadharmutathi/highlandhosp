import DoctorCard from "@/components/molecules/doctorcard";
import { doctorData } from "@/db/dummydata"; // Adjust path to your file location

// Interface for the doctor card data to be used with database data.
interface DoctorCardData {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

export default function OurDoctors() {
  const doctorCards: DoctorCardData[] = doctorData; //For use with database

  return (
    <section className="w-full py-8">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <h2 className="mb-8 text-center text-text-title tracking-tight">
          Our Doctors
        </h2>

        {/* Doctors Grid Container */}
        <div className="flex flex-wrap justify-center gap-8">
          {doctorCards.map((doctor) => (
            <DoctorCard key={doctor.id} {...doctor} className="h-auto" />
          ))}
        </div>
      </div>
    </section>
  );
}
