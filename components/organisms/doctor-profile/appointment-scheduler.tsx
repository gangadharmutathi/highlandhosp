"use client";
// components/organisms/doctor-profile/appointment-scheduler.tsx
//
// The main wrapper component for the Appointment Scheduler.
// This is the ONLY component imported by page.tsx.
//
// Responsibilities:
//   1. Hold shared state: selected date, selected slot, available slots
//   2. Fetch available slots when the patient picks a date
//   3. Manage calendar month navigation
//   4. Pass data down to SchedulerCalendar, SchedulerTimeslots, SchedulerConfirm
//   5. Wrap everything in a shadcn Card to match the design in the screenshot
//
// Data flow (top-down):
//   AppointmentScheduler (state owner)
//     ├── SchedulerCalendar   ← receives days[], triggers onSelectDate
//     ├── SchedulerTimeslots  ← receives slots[], triggers onSelectSlot
//     └── SchedulerConfirm   ← receives date + slot, calls createAppointment
//
// The parent (page.tsx) is a Server Component that fetches DoctorDetails and
// passes them as props. This component is Client-only because it manages
// interactive state (date selection, slot fetching).

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DoctorDetails, TimeSlot } from "@/types";
import {
  getDoctorLeaves,
  getAvailableSlots,
} from "@/lib/actions/appointment.actions";
import SchedulerCalendar, { buildCalendarDays } from "./scheduler-calendar";
import SchedulerTimeslots from "./scheduler-timeslots";
import SchedulerConfirm from "./scheduler-confirm";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface AppointmentSchedulerProps {
  /** Full doctor details fetched in page.tsx (Server Component) */
  doctor: DoctorDetails;
  /**
   * Working day numbers pre-fetched on the server (0=Sun … 6=Sat).
   * Passed as a prop so we don't need an extra client-side fetch on mount.
   * Fetch this in page.tsx using getDoctorWorkingHours().
   */
  workingDays: number[];
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function AppointmentScheduler({
  doctor,
  workingDays,
}: AppointmentSchedulerProps) {
  // ── Calendar navigation state ──
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  // ── Selection state ──
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // ── Slot data state ──
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // ── Leave data state ──
  // We store leaves for the currently viewed month so buildCalendarDays can
  // grey out leave days. Re-fetched whenever the month changes.
  const [monthLeaves, setMonthLeaves] = useState<
    Array<{ leaveDate: Date; leaveType: string }>
  >([]);

  // ── Booking success state ──
  // When booking succeeds, we can reset the scheduler or show a message
  const [bookedAppointmentId, setBookedAppointmentId] = useState<string | null>(
    null,
  );

  // ─────────────────────────────────────────────────────────────────────────
  // DERIVED: Calendar grid — computed directly from existing state/props
  //
  // Why useMemo instead of useState + useEffect?
  // calendarDays is not independent state — it is entirely derived from other
  // values that already live in state (viewYear, viewMonth, selectedDate,
  // monthLeaves) and props (workingDays).
  //
  // useState + useEffect would cause a double render on every change:
  //   1st render: state changes (e.g. user picks a new month)
  //   2nd render: effect runs → setCalendarDays → triggers another render
  //
  // useMemo computes calendarDays in the same render pass, with no extra
  // render cycle. React recalculates it only when one of its dependencies
  // actually changes — identical behaviour, half the renders.
  // ─────────────────────────────────────────────────────────────────────────
  const calendarDays = useMemo(
    () =>
      buildCalendarDays(
        viewYear,
        viewMonth,
        selectedDate,
        workingDays,
        monthLeaves,
      ),
    [viewYear, viewMonth, selectedDate, workingDays, monthLeaves],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECT: Fetch doctor leaves whenever the viewed month changes
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchLeaves() {
      const leaves = await getDoctorLeaves(doctor.userId, viewYear, viewMonth);
      setMonthLeaves(leaves);
    }
    fetchLeaves();
  }, [doctor.userId, viewYear, viewMonth]);

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLER: Patient selects a date on the calendar
  // ─────────────────────────────────────────────────────────────────────────
  const handleSelectDate = async (date: Date) => {
    // Update selected date and clear any previously chosen slot
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);
    setBookedAppointmentId(null);

    // Convert the Date to "YYYY-MM-DD" for the server action
    const dateString = date.toISOString().split("T")[0];

    // Show loading spinner in the timeslots area
    setIsLoadingSlots(true);

    // Fetch available slots from the server
    const result = await getAvailableSlots(doctor.userId, dateString);

    setIsLoadingSlots(false);

    if (result.success && result.data) {
      setAvailableSlots(result.data);
    } else {
      // On error, leave slots empty — SchedulerTimeslots shows "no slots" message
      setAvailableSlots([]);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLER: Patient selects a time slot
  // ─────────────────────────────────────────────────────────────────────────
  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setBookedAppointmentId(null); // clear any previous success state
  };

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLER: Month navigation
  // ─────────────────────────────────────────────────────────────────────────
  // No useCallback is used anywhere in this file.
  // This project uses the React Compiler (Next.js 15 default) which automatically
  // memoizes functions and values. Manually wrapping in useCallback conflicts with
  // the compiler and triggers the react-hooks/preserve-manual-memoization lint error.
  const handlePrevMonth = () => {
    // Calculate the new month and year upfront as plain variables.
    // If we are in January (month 0), going back means December (11) of the previous year.
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const newYear = viewMonth === 0 ? viewYear - 1 : viewYear;

    setViewMonth(newMonth);
    setViewYear(newYear);

    // Clear selection when navigating months — avoids confusion
    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const handleNextMonth = () => {
    // If we are in December (month 11), going forward means January (0) of the next year.
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const newYear = viewMonth === 11 ? viewYear + 1 : viewYear;

    setViewMonth(newMonth);
    setViewYear(newYear);

    setSelectedDate(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // HANDLER: Booking success
  // ─────────────────────────────────────────────────────────────────────────
  const handleBookingSuccess = (appointmentId: string) => {
    setBookedAppointmentId(appointmentId);
    // Optionally reset the calendar after a delay to allow re-booking
    // setTimeout(() => { setSelectedDate(null); setSelectedSlot(null); }, 5000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // Format the selected date as "YYYY-MM-DD" for child components
  const selectedDateString = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : null;

  return (
    // shadcn Card — matches the card style used in the rest of the doctor profile page
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-800">
          Schedule Appointment
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Module 4: Calendar ──────────────────────────────────────── */}
        <SchedulerCalendar
          year={viewYear}
          month={viewMonth}
          days={calendarDays}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectDate={handleSelectDate}
          isLoadingSlots={isLoadingSlots}
        />

        <Separator />

        {/* ── Module 5: Time Slot Picker ──────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Available Time Slots
          </p>
          <SchedulerTimeslots
            slots={availableSlots}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            isLoading={isLoadingSlots}
            hasSelectedDate={selectedDate !== null}
          />
        </div>

        {/* ── Module 6: Booking Confirmation ─────────────────────────── */}
        {/*
          Only shown when:
            1. A date has been selected
            2. A time slot has been selected
            3. No successful booking has been made yet (to avoid double-submits)
          The success view is handled inside SchedulerConfirm itself.
        */}
        {selectedDateString && selectedSlot && (
          <>
            <Separator />
            <SchedulerConfirm
              doctorId={doctor.userId}
              doctorName={doctor.name}
              selectedDate={selectedDateString}
              selectedSlot={selectedSlot}
              onBookingSuccess={handleBookingSuccess}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
