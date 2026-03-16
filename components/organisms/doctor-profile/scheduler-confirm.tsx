"use client";
// components/organisms/doctor-profile/scheduler-confirm.tsx
//
// Shows a summary of the selected date and time slot, then navigates
// the patient to the booking page to fill in their details.
//
// This component no longer calls createAppointment directly —
// that responsibility has moved to the booking page flow.

import { useRouter } from "next/navigation";
import { CalendarDays, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeSlot } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SchedulerConfirmProps {
  /** User.id of the doctor */
  doctorId: string;
  /** Doctor's display name — shown in the summary */
  doctorName: string;
  /** The date the patient selected, as "YYYY-MM-DD" */
  selectedDate: string;
  /** The time slot the patient selected */
  selectedSlot: TimeSlot;
  /** Kept for API compatibility with appointment-scheduler.tsx */
  onBookingSuccess: (appointmentId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — format date for display
// ─────────────────────────────────────────────────────────────────────────────

function formatDateDisplay(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SchedulerConfirm({
  doctorId,
  selectedDate,
  selectedSlot,
}: SchedulerConfirmProps) {
  const router = useRouter();

  // Navigate to the booking page, passing all necessary data as query params.
  // The booking page reads these params to pre-fill the appointment context
  // (doctor, date, time) so the patient does not need to re-select anything.
  function handleContinue() {
    const params = new URLSearchParams({
      doctorId,
      date: selectedDate,
      startUTC: selectedSlot.startUTC,
      endUTC: selectedSlot.endUTC,
      slotLabel: selectedSlot.label,
    });

    router.push(`/appointments/book?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* Appointment summary */}
      <div className="space-y-2">
        {/* Date row */}
        <div className="flex items-center gap-2 text-sm text-text-body">
          <CalendarDays className="w-4 h-4 text-primary shrink-0" />
          <span>{formatDateDisplay(selectedDate)}</span>
        </div>

        {/* Time row */}
        <div className="flex items-center gap-2 text-sm text-text-body">
          <Clock className="w-4 h-4 text-primary shrink-0" />
          <span>{selectedSlot.label}</span>
        </div>
      </div>

      {/* Continue button — navigates to booking page */}
      <Button onClick={handleContinue} variant="brand" className="w-full">
        Continue to Next Step
      </Button>
    </div>
  );
}
