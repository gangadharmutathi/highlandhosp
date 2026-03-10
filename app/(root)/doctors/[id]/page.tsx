import { getDoctorDetails } from "@/lib/actions/doctor.actions";
import { notFound } from "next/navigation";
import DoctorProfileTopCard from "@/components/organisms/doctor-profile/doctorprofile-topcard";

interface DoctorProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DoctorProfilePage({
  params,
}: DoctorProfilePageProps) {
  const { id } = await params;

  const response = await getDoctorDetails(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const doctor = response.data;

  return (
    <div className="w-full flex flex-col md:flex-row justify-between">
      <div className="flex flex-col gap-6 md:gap-8 ms:max-w-[980px]">
        <DoctorProfileTopCard {...doctor} />
        <div className="md:hidden">Appointment Scheduler</div>
        <div>About Section</div>
        <div>Reviews Section</div>
      </div>
      <div className="md:block hidden">Appointment Scheduler</div>
    </div>
  );
}
