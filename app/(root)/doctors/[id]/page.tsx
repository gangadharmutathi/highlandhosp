// app/(root)/doctors/[id]/page.tsx
//
// Server Component — fetches all data for the doctor profile page.
// We added two things to your existing file:
//   1. Import getDoctorWorkingHours to fetch clinic working days server-side
//   2. Replace the two "Appointment Scheduler" placeholder divs with the
//      real AppointmentScheduler component, passing doctor and workingDays as props.
//
// Everything else (getDoctorDetails, notFound, searchParams, layout) is unchanged.

import { getDoctorDetails } from "@/lib/actions/doctor.actions";
import { getDoctorWorkingHours } from "@/lib/actions/appointment.actions";
import { notFound } from "next/navigation";
import DoctorProfileTopCard from "@/components/organisms/doctor-profile/doctorprofile-topcard";
import DoctorProfileAboutSection from "@/components/organisms/doctor-profile/about-doctor";
import DoctorProfileReviewSection from "@/components/organisms/doctor-profile/doctor-profile-review-section";
import AppointmentScheduler from "@/components/organisms/doctor-profile/appointment-scheduler";

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

  // getDoctorDetails must run first on its own because we need to call
  // notFound() if the doctor does not exist — no point fetching working
  // days for a page that will not render.
  const response = await getDoctorDetails(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const doctor = response.data;

  // Now that we know the doctor exists, fetch working days in parallel with
  // any other independent data fetches added here in the future.
  // Promise.all fires all promises simultaneously — total wait time equals
  // the slowest fetch rather than the sum of all fetches.
  const [{ workingDays }] = await Promise.all([
    getDoctorWorkingHours(),
    // Add future independent fetches here, e.g.:
    // getSomethingElse(doctor.userId),
  ]);

  return (
    <div className="w-full flex flex-col md:flex-row justify-between">
      <div className="flex flex-col gap-6 mx-16 mt-8 md:gap-8 ms:max-w-[980px]">
        <DoctorProfileTopCard {...doctor} />

        {/* Scheduler shown inline on mobile (md:hidden), hidden on desktop */}
        <div className="md:hidden">
          <AppointmentScheduler doctor={doctor} workingDays={workingDays} />
        </div>

        <DoctorProfileAboutSection name={doctor.name} brief={doctor.brief} />
        <DoctorProfileReviewSection
          doctorId={doctor.userId}
          rating={doctor.rating}
          currentPage={currentPage}
        />
      </div>

      {/* Scheduler shown in the right column on desktop, hidden on mobile */}
      <div className="md:block hidden mt-8 mr-16 w-full max-w-sm">
        <AppointmentScheduler doctor={doctor} workingDays={workingDays} />
      </div>
    </div>
  );
}
