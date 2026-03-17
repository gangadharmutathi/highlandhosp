// types/index.ts
// Central type definitions for Highland Medical Center.
// We import generated Prisma types where possible to stay in sync with the schema.

import {
  Department,
  BannerImage,
  LeaveType,
  PatientType,
  AppointmentStatus,
} from "@/db/generated/client";

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING TYPES (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export interface ServerActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errorType?: string;
}

export type DepartmentsData = Department;

export type DoctorSummary = {
  id: string | null;
  name: string | null;
  specialty: string | null;
  rating: number | null;
  reviewCount: number | null;
  imageUrl: string | null;
};

export type DoctorReviews = {
  id: string | null;
  patientName: string | null;
  rating: number | null;
  testimonialText: string | null;
  reviewDate: string | null;
  patientImage: string | null;
};

export type BannerImageData = BannerImage;

export interface DoctorDetails {
  id: string; // profileId — used for display
  userId: string; // User.id  — used for querying appointments / leaves
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  brief: string;
  credentials: string;
  languages: string[];
  specializations: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// NEW TYPES — Appointment Scheduler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single bookable time slot shown in the UI.
 *
 * Why store UTC strings?
 * The Appointment model stores appointmentStartUTC / appointmentEndUTC as
 * DateTime (UTC). We calculate the exact UTC moment on the server based on
 * the clinic's local time, and pass those strings all the way to the action
 * so no timezone conversion needs to happen at booking time.
 *
 * `label` is what the patient sees — a simple "HH:MM" local-time string.
 */
export type TimeSlot = {
  label: string; // e.g. "09:00" — displayed as a button in the slot picker
  startUTC: string; // ISO string — stored in Appointment.appointmentStartUTC
  endUTC: string; // ISO string — stored in Appointment.appointmentEndUTC
};

/**
 * Global clinic settings read from the AppSettings table (one row, id="global").
 *
 * AppSettings schema reference:
 *   slotsPerHour  Int    @default(2)       → 2 slots/hr means 30-min appointments
 *   startTime     String @default("09:00") → clinic opens at 09:00 local time
 *   endTime       String @default("17:00") → clinic closes at 17:00 local time
 *
 * These values drive generateAllSlots() in slot-calculator.ts.
 */
export type ClinicSettings = {
  slotsPerHour: number; // e.g. 2 → 30-minute slots; 1 → 60-minute slots
  startTime: string; // "HH:MM" in clinic local time
  endTime: string; // "HH:MM" in clinic local time
};

/**
 * A doctor's leave record for one date.
 * Mirrors the DoctorLeave Prisma model fields we care about.
 *
 * leaveType controls which slots are blocked:
 *   FULL_DAY  → entire day unavailable
 *   MORNING   → slots before 12:00 are blocked
 *   AFTERNOON → slots at 12:00 and after are blocked
 */
export type DoctorLeaveEntry = {
  leaveDate: Date; // Date-only value (time component is midnight)
  leaveType: LeaveType; // imported from generated Prisma client
};

/**
 * Represents one cell in the monthly calendar grid.
 * The SchedulerCalendar component maps over an array of these to render the grid.
 *
 * Flags are computed in the server action / parent component so the calendar
 * itself stays as a "dumb" display component with no business logic.
 */
export type SchedulerDay = {
  date: Date;
  isCurrentMonth: boolean; // false → greyed overflow cell from prev/next month
  isToday: boolean;
  isPast: boolean; // before today → cannot be selected
  isWorkingDay: boolean; // false → clinic is closed (from WorkingDay table)
  isLeaveDay: boolean; // true → doctor has FULL_DAY leave on this date
  isSelected: boolean; // true → patient has clicked this date
};

/**
 * The payload sent to the createAppointment server action.
 *
 * Maps to the Appointment Prisma model:
 *   doctorId             → User.id of the selected doctor
 *   startUTC / endUTC    → appointmentStartUTC / appointmentEndUTC
 *   patientType          → PatientType enum (MYSELF | SOMEONE_ELSE)
 *   patientRelation      → only required when patientType = SOMEONE_ELSE
 */
export type AppointmentRequest = {
  doctorId: string; // User.id of the doctor (not profileId)
  selectedDate: string; // "YYYY-MM-DD" string — kept for display in confirm step
  startUTC: string; // ISO string — from TimeSlot.startUTC
  endUTC: string; // ISO string — from TimeSlot.endUTC
  patientName: string;
  phoneNumber: string;
  reasonForVisit: string;
  patientType: PatientType; // imported from Prisma client — same pattern as LeaveType
  patientRelation?: string; // e.g. "Spouse", "Child" — only when SOMEONE_ELSE
  additionalNotes?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// NEW TYPES — User Profile
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProfileSummary {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phoneNumber: string | null;
  address: string | null;
  dateofBirth: Date | null;
}

export interface UserAppointmentListItem {
  appointmentId: string;
  doctorName: string;
  appointmentStartUTC: string;
  status: AppointmentStatus;
}
