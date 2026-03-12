// lib/utils/slot-calculator.ts
//
// Pure business logic for calculating available appointment slots.
// "Pure" means: no Prisma, no server calls, no side effects.
// Every function takes plain values and returns plain values.
// This makes them easy to test and easy to reason about.

import { TimeSlot, DoctorLeaveEntry } from "@/types";
import { LeaveType } from "@/db/generated/client";

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts an "HH:MM" time string into total minutes since midnight.
 * Used so we can do arithmetic on times without dealing with Date objects.
 *
 * Example: "09:30" → 570
 */
function timeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Converts a total-minutes number back into an "HH:MM" string.
 * Used to produce the `label` shown on each slot button.
 *
 * Example: 570 → "09:30"
 */
function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  // padStart ensures we always get two digits: 9 → "09"
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Builds an ISO UTC string for a given date + "HH:MM" local time.
 *
 * Why do we need this?
 * The Appointment model stores appointmentStartUTC / appointmentEndUTC as
 * proper UTC DateTime values. The clinic's working hours are in local time
 * (e.g. "09:00 local"). We combine the selected date string ("2025-03-09")
 * with the local time ("09:00") and treat it as UTC for simplicity.
 *
 * IMPORTANT: If your clinic is in a non-UTC timezone, you would need to
 * adjust here (e.g. subtract UTC offset). For now we assume the server
 * and clinic are UTC-aligned.
 *
 * Example: ("2025-03-09", "09:30") → "2025-03-09T09:30:00.000Z"
 */
function toUTCISOString(dateString: string, timeString: string): string {
  // We construct "YYYY-MM-DDTHH:MM:00Z" — the Z suffix means UTC
  return `${dateString}T${timeString}:00.000Z`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates every possible time slot for a working day.
 *
 * Parameters:
 *   dateString   — "YYYY-MM-DD" — the date we're generating slots for
 *   startTime    — "HH:MM" — clinic opening time from AppSettings
 *   endTime      — "HH:MM" — clinic closing time from AppSettings
 *   slotsPerHour — integer from AppSettings (e.g. 2 → 30-min slots)
 *
 * Returns an array of TimeSlot objects with label, startUTC, and endUTC.
 *
 * Example with startTime="09:00", endTime="11:00", slotsPerHour=2:
 *   → [{ label:"09:00", startUTC:"...T09:00Z", endUTC:"...T09:30Z" },
 *      { label:"09:30", startUTC:"...T09:30Z", endUTC:"...T10:00Z" },
 *      { label:"10:00", startUTC:"...T10:00Z", endUTC:"...T10:30Z" },
 *      { label:"10:30", startUTC:"...T10:30Z", endUTC:"...T11:00Z" }]
 */
export function generateAllSlots(
  dateString: string,
  startTime: string,
  endTime: string,
  slotsPerHour: number,
): TimeSlot[] {
  // Convert "HH:MM" times to plain minutes for easy arithmetic
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);

  // How many minutes does one slot last?
  // slotsPerHour=2 → 60/2 = 30 minutes per slot
  const slotDurationMinutes = Math.floor(60 / slotsPerHour);

  const slots: TimeSlot[] = [];

  // Walk from startTime to endTime, stepping by slotDurationMinutes each time.
  // We stop when a slot's END would exceed endTime.
  for (
    let currentMinutes = startMinutes;
    currentMinutes + slotDurationMinutes <= endMinutes;
    currentMinutes += slotDurationMinutes
  ) {
    const slotStart = minutesToTimeString(currentMinutes);
    const slotEnd = minutesToTimeString(currentMinutes + slotDurationMinutes);

    slots.push({
      label: slotStart, // "09:00" — what the patient sees
      startUTC: toUTCISOString(dateString, slotStart),
      endUTC: toUTCISOString(dateString, slotEnd),
    });
  }

  return slots;
}

/**
 * Removes slots that are already booked.
 *
 * Parameters:
 *   allSlots    — full list from generateAllSlots()
 *   bookedUTCs  — array of appointmentStartUTC ISO strings from the DB
 *                 (these are the start times of already-booked appointments)
 *
 * How it works:
 *   We compare each slot's startUTC against the bookedUTCs list.
 *   If there's a match → that slot is taken → filter it out.
 *
 * Note: We normalise both sides to remove milliseconds so "...T09:00:00.000Z"
 * matches "...T09:00:00Z" regardless of how Prisma serialises the DateTime.
 */
export function filterAvailableSlots(
  allSlots: TimeSlot[],
  bookedUTCs: string[],
): TimeSlot[] {
  // Normalise booked times: keep only "YYYY-MM-DDTHH:MM" prefix for comparison
  const bookedPrefixes = new Set(
    bookedUTCs.map((utc) => utc.slice(0, 16)), // "2025-03-09T09:00"
  );

  return allSlots.filter((slot) => {
    const slotPrefix = slot.startUTC.slice(0, 16); // "2025-03-09T09:00"
    return !bookedPrefixes.has(slotPrefix); // keep if NOT booked
  });
}

/**
 * Checks whether a given date is available for booking.
 * A date is NOT available if any of these is true:
 *   1. It's in the past (before today)
 *   2. The clinic is closed on that weekday (WorkingDay.isWorkingDay = false)
 *   3. The doctor has a FULL_DAY leave on that date
 *
 * Parameters:
 *   date        — the Date object to check
 *   workingDays — array of dayOfWeek numbers (0=Sun … 6=Sat) that are working days
 *   leaves      — doctor's leave entries for the current month
 *
 * Returns true if the date CAN be selected by the patient.
 */
export function isDateAvailable(
  date: Date,
  workingDays: number[],
  leaves: DoctorLeaveEntry[],
): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // strip time so we compare dates only

  // Rule 1: past dates are not selectable
  if (date < today) return false;

  // Rule 2: check if this weekday is a clinic working day
  const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, …, 6=Saturday
  if (!workingDays.includes(dayOfWeek)) return false;

  // Rule 3: check for a FULL_DAY doctor leave on this exact date
  const dateStr = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const hasFullDayLeave = leaves.some((leave) => {
    const leaveDateStr = leave.leaveDate.toISOString().split("T")[0];
    return leaveDateStr === dateStr && leave.leaveType === LeaveType.FULL_DAY;
  });

  return !hasFullDayLeave;
}

/**
 * Further filters slots based on partial-day leave (MORNING / AFTERNOON).
 *
 * Called after filterAvailableSlots() to also remove morning or afternoon
 * slots when the doctor has a partial leave.
 *
 * MORNING   leave → remove all slots with label < "12:00"
 * AFTERNOON leave → remove all slots with label >= "12:00"
 * FULL_DAY  leave → should have been caught by isDateAvailable() already,
 *                   but we return empty to be safe
 *
 * Parameters:
 *   slots  — already filtered available slots for the date
 *   leaves — doctor leave entries (we look for the one matching the date)
 *   date   — the date we're filtering for
 */
export function applyPartialLeaveFilter(
  slots: TimeSlot[],
  leaves: DoctorLeaveEntry[],
  date: Date,
): TimeSlot[] {
  const dateStr = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

  // Find any leave record for this exact date
  const leaveForDate = leaves.find((leave) => {
    const leaveDateStr = leave.leaveDate.toISOString().split("T")[0];
    return leaveDateStr === dateStr;
  });

  // No leave → return all slots unchanged
  if (!leaveForDate) return slots;

  if (leaveForDate.leaveType === LeaveType.FULL_DAY) {
    // Safety net: entire day blocked
    return [];
  }

  if (leaveForDate.leaveType === LeaveType.MORNING) {
    // Remove slots before noon — the doctor is absent in the morning
    return slots.filter((slot) => slot.label >= "12:00");
  }

  if (leaveForDate.leaveType === LeaveType.AFTERNOON) {
    // Remove slots from noon onwards — the doctor is absent in the afternoon
    return slots.filter((slot) => slot.label < "12:00");
  }

  return slots; // default: no change
}
