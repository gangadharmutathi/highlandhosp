// app/(root)/user/[id]/page.tsx
//
// Server Component — renders the Patient/User Profile page.
//
// Responsibilities:
//   1. Read the userId route param (Next.js App Router: params is a Promise)
//   2. Fetch the User record (name, image, contact details) from Prisma
//   3. Fetch the first page of appointments (server-side pagination)
//   4. Render a responsive layout matching the provided UI screenshot:
//        - Block 1: Profile header (Avatar + name)
//        - Block 2: Personal information (full-width Card)
//        - Block 3: Appointment list (client component for cancel dialog + pagination)
//
// IMPORTANT:
// Header/Footer are intentionally NOT rendered here.
// They come from `app/(root)/layout.tsx` to avoid duplication across pages.

import { notFound } from "next/navigation";
import { Mail, MapPin, Phone, Cake, User as UserIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/db/prisma";
import AppointmentList from "@/components/organisms/user-profile/appointment-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAppointmentListItem, UserProfileSummary } from "@/types";

const PAGE_SIZE = 5;

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

function formatDateOfBirth(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Fetches a user profile summary and a paginated slice of their appointments.
 *
 * - User is read from `User` by id
 * - Appointments are read from `Appointment` where userId === id
 * - Includes `doctor` relation to display doctor name
 */
async function getUserProfilePageData(userId: string, page: number) {
  const [user, totalAppointments, appointments] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phoneNumber: true,
        address: true,
        dateofBirth: true,
      },
    }),
    prisma.appointment.count({
      where: { userId },
    }),
    prisma.appointment.findMany({
      where: { userId },
      orderBy: { appointmentStartUTC: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        doctor: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  if (!user) return null;

  const profile: UserProfileSummary = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    phoneNumber: user.phoneNumber ?? null,
    address: user.address ?? null,
    dateofBirth: user.dateofBirth ?? null,
  };

  const list: UserAppointmentListItem[] = appointments.map((appt) => ({
    appointmentId: appt.appointmentId,
    doctorName: appt.doctor?.name ?? "Doctor",
    appointmentStartUTC: appt.appointmentStartUTC.toISOString(),
    status: appt.status,
  }));

  return {
    profile,
    appointments: list,
    totalAppointments,
    totalPages: Math.max(1, Math.ceil(totalAppointments / PAGE_SIZE)),
  };
}

export default async function UserProfilePage({
  params,
  searchParams,
}: UserProfilePageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1") || 1);

  const data = await getUserProfilePageData(id, page);
  if (!data) notFound();

  const { profile, appointments, totalAppointments, totalPages } = data;

  const initials =
    profile.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-6">
      {/* Block 1: Profile Header */}
      <div className="mb-6 flex items-center gap-4">
        <Avatar className="size-16 border border-border-2 bg-muted">
          {profile.image ? (
            <AvatarImage src={profile.image} alt={profile.name} />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="text-sm text-text-muted">User Profile</p>
          <h1 className="truncate text-2xl font-bold text-text-title">
            {profile.name}
          </h1>
        </div>
      </div>

      {/* Block 2: Personal Info (full width) */}
      <Card className="border border-border-1 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-text-title">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-text-muted">Full Name</p>
            <p className="text-sm text-text-body inline-flex items-center gap-2">
              <UserIcon className="size-4 text-text-muted" />
              {profile.name}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-text-muted">Email</p>
            <p className="text-sm text-text-body inline-flex items-center gap-2">
              <Mail className="size-4 text-text-muted" />
              {profile.email}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-text-muted">Phone</p>
            <p className="text-sm text-text-body inline-flex items-center gap-2">
              <Phone className="size-4 text-text-muted" />
              {profile.phoneNumber ?? "—"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-text-muted">Date of Birth</p>
            <p className="text-sm text-text-body inline-flex items-center gap-2">
              <Cake className="size-4 text-text-muted" />
              {formatDateOfBirth(profile.dateofBirth)}
            </p>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <p className="text-xs font-medium text-text-muted">Address</p>
            <p className="text-sm text-text-body inline-flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-text-muted" />
              <span>{profile.address ?? "—"}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Block 3: Appointment List */}
      <div className="mt-6">
        <AppointmentList
          userId={profile.id}
          appointments={appointments}
          currentPage={page}
          totalPages={totalPages}
          totalAppointments={totalAppointments}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
