// app/(root)/appointments/book/page.tsx
//
// Step 3 of the booking flow — Patient Details.
//
// This is a Server Component that reads the query params passed from
// scheduler-confirm.tsx and passes them down to the BookingForm client component.
//
// Query params expected:
//   doctorId   — User.id of the doctor
//   date       — "YYYY-MM-DD"
//   startUTC   — ISO string for slot start
//   endUTC     — ISO string for slot end
//   slotLabel  — e.g. "10:00" — displayed in the header

import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions/auth.actions";
import { prisma } from "@/db/prisma";
import BookingForm from "@/components/organisms/booking/booking-form";

interface BookingPageProps {
  searchParams: Promise<{
    doctorId?: string;
    date?: string;
    startUTC?: string;
    endUTC?: string;
    slotLabel?: string;
  }>;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const { doctorId, date, startUTC, endUTC, slotLabel } = params;

  // Guard: all params are required — if any are missing, redirect home
  if (!doctorId || !date || !startUTC || !endUTC || !slotLabel) {
    redirect("/");
  }

  // Fetch doctor details for the header display
  const doctorProfile = await prisma.doctorProfile.findFirst({
    where: { userId: doctorId },
    select: {
      specialty: true,
      consultationFee: true,
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!doctorProfile) {
    redirect("/");
  }

  // Get session — if logged in, pre-fill name and phone
  const session = await getSession();
  console.log(
    "[BookingPage] session user:",
    JSON.stringify(session?.user, null, 2),
  );
  const prefillName = session?.user?.name ?? "";
  const prefillPhone = session?.user
    ? (((session.user as Record<string, unknown>).phoneNumber as string) ?? "")
    : "";

  return (
    <BookingForm
      doctorId={doctorId}
      doctorName={doctorProfile.user.name}
      doctorSpecialty={doctorProfile.specialty ?? ""}
      doctorImage={doctorProfile.user.image ?? null}
      consultationFee={doctorProfile.consultationFee ?? 0}
      selectedDate={date}
      startUTC={startUTC}
      endUTC={endUTC}
      slotLabel={slotLabel}
      prefillName={prefillName}
      prefillPhone={prefillPhone}
    />
  );
}
