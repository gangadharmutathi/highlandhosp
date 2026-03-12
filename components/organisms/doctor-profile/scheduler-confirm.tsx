"use client";
// components/organisms/doctor-profile/scheduler-confirm.tsx
//
// Shows a summary of the selected date and time slot, then lets the patient
// click "Continue to Next Step" to book the appointment.
//
// For now this calls createAppointment directly.
// In a future phase this would hand off to a payment flow.
//
// States:
//   • Ready    — shows date, time, doctor name, and the confirm button
//   • Loading  — button shows spinner while createAppointment runs
//   • Error    — displays error message (e.g. slot was just taken)
//   • Success  — displays a confirmation message with appointment ID

import { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeSlot, AppointmentRequest, ServerActionResponse } from "@/types";
import { createAppointment } from "@/lib/actions/appointment.actions";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SchedulerConfirmProps {
  /** User.id of the doctor — passed to createAppointment */
  doctorId: string;
  /** Doctor's display name — shown in the confirmation summary */
  doctorName: string;
  /** The date the patient selected, as "YYYY-MM-DD" */
  selectedDate: string;
  /** The time slot the patient selected */
  selectedSlot: TimeSlot;
  /** Called when booking succeeds — lets the parent reset state if needed */
  onBookingSuccess: (appointmentId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — format date for display
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts "YYYY-MM-DD" to a readable string like "Sunday, March 9, 2025".
 * We add T00:00:00 to avoid timezone-shift issues that can cause the date
 * to appear as the previous day when parsed in certain timezones.
 */
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
  doctorName,
  selectedDate,
  selectedSlot,
  onBookingSuccess,
}: SchedulerConfirmProps) {
  // Track whether the booking request is in flight
  const [isLoading, setIsLoading] = useState(false);

  // Holds an error message if createAppointment fails
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Holds the appointmentId on success — switches component to success view
  const [bookedId, setBookedId] = useState<string | null>(null);

  // ── Handle confirm button click ──
  async function handleConfirm() {
    setIsLoading(true);
    setErrorMessage(null);

    // Build the AppointmentRequest payload.
    // NOTE: patientName and phoneNumber are hardcoded as placeholders here.
    // In a real flow you'd collect these from a form in a previous step,
    // or pull them from the logged-in user's session.
    const appointmentData: AppointmentRequest = {
      doctorId,
      selectedDate,
      startUTC: selectedSlot.startUTC,
      endUTC: selectedSlot.endUTC,
      patientName: "Guest Patient", // TODO: replace with actual patient name from form/session
      phoneNumber: "", // TODO: replace with actual phone number
      reasonForVisit: "", // TODO: replace with actual reason
      patientType: "MYSELF", // TODO: make this selectable in the form
    };

    // Call the server action — this runs on the server even though we're in a client component
    const result: ServerActionResponse<{ appointmentId: string }> =
      await createAppointment(appointmentData);

    setIsLoading(false);

    if (result.success && result.data) {
      // Booking succeeded — switch to success view
      setBookedId(result.data.appointmentId);
      onBookingSuccess(result.data.appointmentId);
    } else {
      // Show the error message from the server action
      setErrorMessage(
        result.error ?? "Something went wrong. Please try again.",
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUCCESS STATE — shown after a successful booking
  // ─────────────────────────────────────────────────────────────────────────
  if (bookedId) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
        <p className="font-semibold text-gray-800">Appointment Booked!</p>
        <p className="text-sm text-gray-500">
          Your appointment with <strong>{doctorName}</strong> on{" "}
          <strong>{formatDateDisplay(selectedDate)}</strong> at{" "}
          <strong>{selectedSlot.label}</strong> is confirmed.
        </p>
        <p className="text-xs text-gray-400">Reference: {bookedId}</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEFAULT STATE — summary + confirm button
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Appointment summary */}
      <div className="space-y-2">
        {/* Date row */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <CalendarDays className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{formatDateDisplay(selectedDate)}</span>
        </div>

        {/* Time row */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock className="w-4 h-4 text-blue-500 shrink-0" />
          <span>{selectedSlot.label}</span>
        </div>
      </div>

      {/* Error message — shown if createAppointment returned an error */}
      {errorMessage && (
        <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Confirm button */}
      <Button
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isLoading ? (
          // Spinner shown while the server action is running
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Booking…
          </span>
        ) : (
          "Continue to Next Step"
        )}
      </Button>
    </div>
  );
}
