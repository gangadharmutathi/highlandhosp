"use server";
// lib/actions/appointment.actions.ts
//
// All server actions for the Appointment Scheduler feature.
// "use server" at the top marks every exported function in this file
// as a Next.js Server Action — they run on the server and can be called
// directly from Client Components.
//
// Data flow:
//   Client component calls action → action queries Prisma → returns plain data
//
// We never return Prisma model objects directly to the client.
// Instead we shape the data into our own types (TimeSlot, etc.) so that
// the client is decoupled from the database schema.

import { prisma } from "@/db/prisma";
import {
  AppointmentRequest,
  TimeSlot,
  ClinicSettings,
  DoctorLeaveEntry,
  ServerActionResponse,
} from "@/types";
import { AppointmentStatus, PatientType } from "@/db/generated/client";
import { getSession } from "@/lib/actions/auth.actions";
import { revalidatePath } from "next/cache";
import {
  generateAllSlots,
  filterAvailableSlots,
  isDateAvailable,
  applyPartialLeaveFilter,
} from "@/lib/utils/slot-calculator";

// ─────────────────────────────────────────────────────────────────────────────
// 1. getDoctorWorkingHours
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the clinic-wide settings and the list of working weekdays.
 *
 * Why clinic-wide? The schema has one AppSettings row (id="global") and a
 * WorkingDay table that applies to all doctors. Individual doctor overrides
 * are handled through the DoctorLeave table, not separate working-hours rows.
 *
 * Returns:
 *   settings    — startTime, endTime, slotsPerHour
 *   workingDays — array of dayOfWeek numbers (e.g. [1,2,3,4,5] = Mon–Fri)
 */
export async function getDoctorWorkingHours(): Promise<{
  settings: ClinicSettings;
  workingDays: number[];
}> {
  // Fetch the single global settings row
  const appSettings = await prisma.appSettings.findUnique({
    where: { id: "global" },
  });

  // Fallback to defaults if the row doesn't exist yet
  const settings: ClinicSettings = {
    slotsPerHour: appSettings?.slotsPerHour ?? 2,
    startTime: appSettings?.startTime ?? "09:00",
    endTime: appSettings?.endTime ?? "17:00",
  };

  // Fetch which days of the week the clinic is open
  const workingDayRows = await prisma.workingDay.findMany({
    where: { isWorkingDay: true }, // only days the clinic is actually open
  });

  // Extract just the dayOfWeek numbers into a plain array
  const workingDays = workingDayRows.map((row) => row.dayOfWeek);

  return { settings, workingDays };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. getDoctorLeaves
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all leave records for a doctor within a given month.
 *
 * We scope the query to the current month so we're not loading years of
 * leave history. The calendar only shows one month at a time.
 *
 * Parameters:
 *   doctorId — User.id of the doctor (NOT profileId)
 *   year     — 4-digit year number (e.g. 2025)
 *   month    — 0-indexed month (0=Jan … 11=Dec) — matches JavaScript's Date API
 */
export async function getDoctorLeaves(
  doctorId: string,
  year: number,
  month: number, // 0-indexed
): Promise<DoctorLeaveEntry[]> {
  // Calculate the first and last moment of the requested month
  const monthStart = new Date(year, month, 1); // e.g. 2025-03-01T00:00:00
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59); // e.g. 2025-03-31T23:59:59

  const leaves = await prisma.doctorLeave.findMany({
    where: {
      doctorId,
      leaveDate: {
        gte: monthStart, // greater than or equal to start of month
        lte: monthEnd, // less than or equal to end of month
      },
    },
    select: {
      leaveDate: true,
      leaveType: true,
    },
  });

  // Shape into our DoctorLeaveEntry type (strip Prisma metadata)
  return leaves.map((leave) => ({
    leaveDate: leave.leaveDate,
    leaveType: leave.leaveType,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. getBookedSlots
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the start times of all confirmed/pending appointments for a doctor
 * on a specific date. These are the slots we need to block in the UI.
 *
 * We include PAYMENT_PENDING because a slot being paid for should be blocked
 * too (to avoid double-booking while payment is in progress).
 * We exclude CANCELLED and NO_SHOW because those slots are free again.
 *
 * Parameters:
 *   doctorId    — User.id of the doctor
 *   dateString  — "YYYY-MM-DD" — the date selected in the calendar
 *
 * Returns an array of ISO UTC start-time strings for booked appointments.
 */
export async function getBookedSlots(
  doctorId: string,
  dateString: string,
): Promise<string[]> {
  // Build the date range: midnight to 23:59:59 on the selected date
  const dayStart = new Date(`${dateString}T00:00:00.000Z`);
  const dayEnd = new Date(`${dateString}T23:59:59.999Z`);

  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId,
      appointmentStartUTC: {
        gte: dayStart, // from start of day
        lte: dayEnd, // to end of day
      },
      // Only block slots that are actively reserved — free cancelled ones
      status: {
        in: [
          AppointmentStatus.PAYMENT_PENDING,
          AppointmentStatus.BOOKING_CONFIRMED,
          AppointmentStatus.CASH,
          AppointmentStatus.COMPLETED,
        ],
      },
    },
    select: {
      // We only need the start time to know which slot is taken
      appointmentStartUTC: true,
    },
  });

  // Convert each DateTime to an ISO string for comparison in the calculator
  return appointments.map((appt) => appt.appointmentStartUTC.toISOString());
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. getAvailableSlots
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The main "combined" action that the UI calls when a patient selects a date.
 *
 * It orchestrates the three steps:
 *   1. Get clinic settings + working days
 *   2. Get doctor's booked slots for the selected date
 *   3. Get doctor's leaves for that date
 *   4. Generate all possible slots → remove booked → remove leave blocks
 *
 * Parameters:
 *   doctorId   — User.id of the doctor
 *   dateString — "YYYY-MM-DD" — the date selected in the calendar
 *
 * Returns a ServerActionResponse wrapping an array of available TimeSlot objects.
 */
export async function getAvailableSlots(
  doctorId: string,
  dateString: string,
): Promise<ServerActionResponse<TimeSlot[]>> {
  try {
    // Parse the dateString into a Date object for utility functions
    const selectedDate = new Date(`${dateString}T00:00:00.000Z`);
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth(); // 0-indexed

    // Step 1: Fetch clinic settings and which weekdays are working days
    const { settings, workingDays } = await getDoctorWorkingHours();

    // Step 2: Fetch this doctor's leaves for the selected month
    const leaves = await getDoctorLeaves(doctorId, year, month);

    // Step 3: Check if the selected date is even available before generating slots
    // This is a guard against the client sending a date that should be disabled
    if (!isDateAvailable(selectedDate, workingDays, leaves)) {
      return {
        success: false,
        message: "No appointments available on this date.",
        data: [],
      };
    }

    // Step 4: Generate all theoretically possible slots for the day
    const allSlots = generateAllSlots(
      dateString,
      settings.startTime,
      settings.endTime,
      settings.slotsPerHour,
    );

    // Step 5: Fetch which slots are already booked
    const bookedUTCs = await getBookedSlots(doctorId, dateString);

    // Step 6: Remove booked slots from the full list
    const unbookedSlots = filterAvailableSlots(allSlots, bookedUTCs);

    // Step 7: Remove slots blocked by partial-day leave (MORNING / AFTERNOON)
    const finalSlots = applyPartialLeaveFilter(
      unbookedSlots,
      leaves,
      selectedDate,
    );

    return {
      success: true,
      data: finalSlots,
    };
  } catch (error) {
    console.error("[getAvailableSlots] Error:", error);
    return {
      success: false,
      error: "Failed to load available slots. Please try again.",
      data: [],
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. createAppointment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Books an appointment and saves it to the database.
 *
 * Called from the SchedulerConfirm component when the patient clicks "Confirm".
 *
 * What it does:
 *   1. Validates that the chosen slot is still available (race condition guard)
 *   2. Creates the Appointment row in the DB
 *   3. Returns success or a descriptive error
 *
 * The appointment is created with status PAYMENT_PENDING — your payment flow
 * will update this to BOOKING_CONFIRMED once payment is complete.
 *
 * Parameters:
 *   data — AppointmentRequest built by the SchedulerConfirm component
 */
export async function createAppointment(
  data: AppointmentRequest,
): Promise<ServerActionResponse<{ appointmentId: string }>> {
  try {
    // Convert the ISO strings back to Date objects for Prisma
    const startUTC = new Date(data.startUTC);
    const endUTC = new Date(data.endUTC);

    // Race-condition guard: check the slot is still free
    // (another patient might have booked it while this one was filling the form)
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        appointmentStartUTC: startUTC,
        status: {
          in: [
            AppointmentStatus.PAYMENT_PENDING,
            AppointmentStatus.BOOKING_CONFIRMED,
            AppointmentStatus.CASH,
            AppointmentStatus.COMPLETED,
          ],
        },
      },
    });

    if (conflict) {
      return {
        success: false,
        error:
          "This slot was just booked by someone else. Please select another time.",
        errorType: "SLOT_TAKEN",
      };
    }

    // Create the appointment record
    const appointment = await prisma.appointment.create({
      data: {
        doctorId: data.doctorId,
        patientName: data.patientName,
        phoneNumber: data.phoneNumber,
        reasonForVisit: data.reasonForVisit,
        additionalNotes: data.additionalNotes ?? null,
        patientType: data.patientType as PatientType,
        patientRelation: data.patientRelation ?? null,
        appointmentStartUTC: startUTC,
        appointmentEndUTC: endUTC,
        status: AppointmentStatus.PAYMENT_PENDING,
        // userId is null for guest bookings — your auth flow can populate this
        // if the user is logged in at booking time
      },
    });

    return {
      success: true,
      message: "Appointment booked successfully!",
      data: { appointmentId: appointment.appointmentId },
    };
  } catch (error) {
    console.error("[createAppointment] Error:", error);
    return {
      success: false,
      error: "Failed to book appointment. Please try again.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. cancelAppointment
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cancels an appointment for the currently logged-in patient.
 *
 * What it does:
 * - Validates the session (must be logged in)
 * - Ensures the appointment belongs to the patient (userId match)
 * - Updates status to CANCELLED
 * - Clears any reservation expiry so the slot is considered free again
 * - Revalidates `/user/[id]` so the profile page refreshes
 *
 * Note on "releasing the doctor's time slot":
 * This system derives availability from booked appointments. Marking an
 * appointment as CANCELLED removes it from the booked-slot set, effectively
 * releasing that time slot.
 */
export async function cancelAppointment(
  appointmentId: string,
  userId: string,
): Promise<ServerActionResponse> {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "You must be signed in to cancel an appointment.",
        errorType: "UNAUTHENTICATED",
      };
    }

    if (session.user.id !== userId) {
      return {
        success: false,
        error: "You are not allowed to cancel this appointment.",
        errorType: "FORBIDDEN",
      };
    }

    const appointment = await prisma.appointment.findUnique({
      where: { appointmentId },
      select: { appointmentId: true, userId: true, status: true },
    });

    if (!appointment || appointment.userId !== userId) {
      return {
        success: false,
        error: "Appointment not found.",
        errorType: "NOT_FOUND",
      };
    }

    if (
      appointment.status === AppointmentStatus.CANCELLED ||
      appointment.status === AppointmentStatus.COMPLETED
    ) {
      return {
        success: false,
        error: "This appointment can no longer be cancelled.",
        errorType: "NOT_CANCELLABLE",
      };
    }

    await prisma.appointment.update({
      where: { appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        reservationExpiresAt: null,
      },
    });

    revalidatePath(`/user/${userId}`);

    return { success: true, message: "Appointment cancelled." };
  } catch (error) {
    console.error("[cancelAppointment] Error:", error);
    return {
      success: false,
      error: "Failed to cancel appointment. Please try again.",
      errorType: "UNKNOWN",
    };
  }
}
