import { getDoctorDetails } from "@/lib/actions/doctor.actions";
import { notFound } from "next/navigation";
import DoctorProfileTopCard from "@/components/organisms/doctor-profile/doctorprofile-topcard";
import DoctorProfileAboutSection from "@/components/organisms/doctor-profile/about-doctor";
import DoctorProfileReviewSection from "@/components/organisms/doctor-profile/doctor-profile-review-section";

interface DoctorProfilePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function DoctorProfilePage({
  params,
  searchParams,
}: DoctorProfilePageProps) {
  const { id } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const response = await getDoctorDetails(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const doctor = response.data;

  return (
    <div className="w-full flex flex-col md:flex-row justify-between">
      <div className="flex flex-col gap-6 mx-16 mt-8 md:gap-8 ms:max-w-[980px]">
        <DoctorProfileTopCard {...doctor} />
        <div className="md:hidden">Appointment Scheduler</div>
        <DoctorProfileAboutSection name={doctor.name} brief={doctor.brief} />
        <DoctorProfileReviewSection
          doctorId={doctor.userId}
          rating={doctor.rating}
          currentPage={currentPage}
        />
        <div>Reviews Section</div>
      </div>
      <div className="md:block hidden">Appointment Scheduler</div>
    </div>
  );
}
