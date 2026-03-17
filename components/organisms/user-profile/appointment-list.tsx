"use client";

// components/organisms/user-profile/appointment-list.tsx
//
// Client Component — renders the paginated appointment list inside the User Profile page.
//
// Why client-side?
// - We need interactivity for the cancellation flow:
//   clicking "Cancel" opens a modal (AlertDialog) and triggers a Server Action.
// - Pagination UI updates the `page` query param via `ReviewPagination`
//   (reused from doctor reviews; do not refactor that component).
//
// Data flow:
//   Server page → passes appointments[] + pagination metadata → this component
//   Cancel "Yes" → calls `cancelAppointment()` Server Action → action revalidates
//   `/user/[id]` so the Server Component refetches fresh data.

import { useState, useTransition } from "react";
import { CalendarDays, Clock, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ReviewPagination from "@/components/organisms/doctor-profile/review-pagination";
import { cancelAppointment } from "@/lib/actions/appointment.actions";
import { cn } from "@/lib/utils";
import { UserAppointmentListItem } from "@/types";
import { AppointmentStatus } from "@/db/generated/client";

interface AppointmentListProps {
  userId: string;
  appointments: UserAppointmentListItem[];
  currentPage: number;
  totalPages: number;
  totalAppointments: number;
  pageSize: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — formatting + status mapping
// ─────────────────────────────────────────────────────────────────────────────

function formatDateDisplay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeDisplay(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getStatusStyles(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.BOOKING_CONFIRMED:
    case AppointmentStatus.PAYMENT_PENDING:
    case AppointmentStatus.CASH:
      return "bg-blue-100 text-blue-700";
    case AppointmentStatus.COMPLETED:
      return "bg-green-100 text-green-700";
    case AppointmentStatus.CANCELLED:
    case AppointmentStatus.NO_SHOW:
      return "bg-red-100 text-red-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getStatusLabel(status: AppointmentStatus): string {
  switch (status) {
    case AppointmentStatus.BOOKING_CONFIRMED:
      return "Upcoming";
    case AppointmentStatus.PAYMENT_PENDING:
      return "Upcoming";
    case AppointmentStatus.CASH:
      return "Upcoming";
    case AppointmentStatus.COMPLETED:
      return "Completed";
    case AppointmentStatus.CANCELLED:
      return "Cancelled";
    case AppointmentStatus.NO_SHOW:
      return "Cancelled";
    default:
      return String(status);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AppointmentList({
  userId,
  appointments,
  currentPage,
  totalPages,
  totalAppointments,
  pageSize,
}: AppointmentListProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirmCancel = (appointmentId: string) => {
    startTransition(async () => {
      await cancelAppointment(appointmentId, userId);
      setOpenId(null);
    });
  };

  return (
    <Card className="border border-border-1 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-text-title">
          Appointments
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-sm text-text-muted">No appointments found.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const isUpcoming =
                appt.status === AppointmentStatus.BOOKING_CONFIRMED ||
                appt.status === AppointmentStatus.PAYMENT_PENDING ||
                appt.status === AppointmentStatus.CASH;
              const isCompleted = appt.status === AppointmentStatus.COMPLETED;
              const isCancelled =
                appt.status === AppointmentStatus.CANCELLED ||
                appt.status === AppointmentStatus.NO_SHOW;

              return (
                <div
                  key={appt.appointmentId}
                  className="flex flex-col gap-3 rounded-lg border border-border-1 bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-text-body">
                      <Stethoscope className="size-4 text-text-muted" />
                      <span className="truncate">{appt.doctorName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        {formatDateDisplay(appt.appointmentStartUTC)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-3.5" />
                        {formatTimeDisplay(appt.appointmentStartUTC)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <Badge
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium",
                        getStatusStyles(appt.status),
                      )}
                    >
                      {getStatusLabel(appt.status)}
                    </Badge>

                    {isUpcoming && (
                      <AlertDialog
                        open={openId === appt.appointmentId}
                        onOpenChange={(open) =>
                          setOpenId(open ? appt.appointmentId : null)
                        }
                      >
                        <Button
                          variant="outline"
                          className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => setOpenId(appt.appointmentId)}
                        >
                          Cancel
                        </Button>

                        <AlertDialogContent className="max-w-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Cancel Appointment
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this appointment?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="justify-center sm:justify-center">
                            <AlertDialogCancel
                              className="h-9 min-w-20"
                              autoFocus
                            >
                              No
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="h-9 min-w-20 bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() =>
                                handleConfirmCancel(appt.appointmentId)
                              }
                              disabled={isPending}
                            >
                              Yes
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {isCompleted && (
                      <Button
                        variant="outline"
                        className="h-8 border-border-3 text-text-body hover:bg-background-soft"
                        onClick={() => {
                          // Placeholder: review flow will be wired later.
                        }}
                      >
                        Leave Review
                      </Button>
                    )}

                    {isCancelled && (
                      <span className="text-xs text-text-muted" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ReviewPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalReviews={totalAppointments}
          pageSize={pageSize}
        />
      </CardContent>
    </Card>
  );
}

