"use client";
// components/organisms/doctor-profile/scheduler-calendar.tsx
//
// Displays a monthly calendar so the patient can pick an appointment date.
//
// This is a "dumb" UI component — it receives all state as props and
// communicates back to the parent (AppointmentScheduler) only via callbacks.
// It does NOT fetch data or run server actions.
//
// Visual states for each day cell:
//   • Past / non-working / full-day leave → greyed out, not clickable
//   • Today → highlighted with a ring
//   • Available → white, clickable, hover effect
//   • Selected → filled blue (the clinic's brand blue from the screenshot)

import { ChevronLeft, ChevronRight } from "lucide-react";
import { SchedulerDay } from "@/types";
import { cn } from "@/lib/utils"; // shadcn's classname utility

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SchedulerCalendarProps {
  /** The year currently displayed (e.g. 2025) */
  year: number;
  /** The 0-indexed month currently displayed (0=Jan … 11=Dec) */
  month: number;
  /** Grid of SchedulerDay objects — one per cell in the calendar grid */
  days: SchedulerDay[];
  /** Called when the user clicks the "previous month" arrow */
  onPrevMonth: () => void;
  /** Called when the user clicks the "next month" arrow */
  onNextMonth: () => void;
  /** Called when the user clicks an available day cell */
  onSelectDate: (date: Date) => void;
  /** True while the parent is loading available slots after a date click */
  isLoadingSlots: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Abbreviated weekday headers: Su Mo Tu We Th Fr Sa */
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Full month names for the header label */
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SchedulerCalendar({
  year,
  month,
  days,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  isLoadingSlots,
}: SchedulerCalendarProps) {
  // Determine if "previous month" should be disabled.
  // We don't allow navigating to months before the current one.
  const today = new Date();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  return (
    <div className="w-full">
      {/* ── Month navigation header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        {/* Previous month button — disabled if we're already on the current month */}
        <button
          onClick={onPrevMonth}
          disabled={isCurrentMonth}
          aria-label="Previous month"
          className={cn(
            "p-1 rounded-md transition-colors",
            isCurrentMonth
              ? "text-gray-300 cursor-not-allowed" // disabled style
              : "text-gray-600 hover:bg-gray-100 cursor-pointer", // active style
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* "March 2025" label */}
        <span className="text-sm font-semibold text-gray-800">
          {MONTH_NAMES[month]} {year}
        </span>

        {/* Next month button — always enabled (patients can book future months) */}
        <button
          onClick={onNextMonth}
          aria-label="Next month"
          className="p-1 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Weekday header row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── Day cells grid ───────────────────────────────────────────────── */}
      {/*
        We always render a 6-row × 7-column grid (42 cells).
        Cells for days outside the current month are rendered as empty or
        greyed-out overflow numbers.
      */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, index) => {
          // A day is "disabled" (not clickable) if it's past, non-working, or on leave
          const isDisabled = day.isPast || !day.isWorkingDay || day.isLeaveDay;

          return (
            <button
              key={index}
              // Don't allow clicking disabled days or days outside the current month
              disabled={isDisabled || !day.isCurrentMonth}
              onClick={() => {
                if (!isDisabled && day.isCurrentMonth) {
                  onSelectDate(day.date);
                }
              }}
              aria-label={
                day.isCurrentMonth
                  ? `${day.date.getDate()} ${MONTH_NAMES[month]} ${year}`
                  : undefined
              }
              aria-pressed={day.isSelected}
              className={cn(
                // Base styles for every cell
                "relative h-8 w-full flex items-center justify-center text-xs rounded-md transition-colors",

                // Days outside the current month: greyed out number, not interactive
                !day.isCurrentMonth && "text-gray-300 cursor-default",

                // Disabled days within the current month (past / closed / leave)
                day.isCurrentMonth &&
                  isDisabled &&
                  "text-gray-300 cursor-not-allowed",

                // Selected date: filled with the brand blue (#1976D2 from the screenshot)
                day.isSelected && "bg-primary text-white font-semibold",

                // Today (but not selected): ring highlight
                day.isToday &&
                  !day.isSelected &&
                  "ring-1 ring-blue-400 text-blue-600 font-medium",

                // Available and hoverable (not disabled, not selected)
                day.isCurrentMonth &&
                  !isDisabled &&
                  !day.isSelected &&
                  "text-gray-800 hover:bg-blue-50 hover:text-blue-600 cursor-pointer",

                // While loading slots after a click, show a subtle cursor
                isLoadingSlots && !isDisabled && "cursor-wait",
              )}
            >
              {/* Only show the date number if it's in the current month.
                  Overflow cells from prev/next month are shown dimmed. */}
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — buildCalendarDays
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the 42-cell grid for the calendar.
 * Called in the parent (AppointmentScheduler) whenever the month changes.
 *
 * Why 42 cells? 6 rows × 7 columns ensures we always have enough space for
 * any month regardless of which day of the week it starts on.
 *
 * Parameters:
 *   year        — the year to build the grid for
 *   month       — 0-indexed month
 *   selectedDate — currently selected date (or null if none selected)
 *   workingDays  — array of dayOfWeek numbers that are clinic working days
 *   leaves       — doctor's leave entries for this month
 *
 * Returns an array of 42 SchedulerDay objects ready to render.
 */
export function buildCalendarDays(
  year: number,
  month: number,
  selectedDate: Date | null,
  workingDays: number[],
  leaves: Array<{ leaveDate: Date; leaveType: string }>,
): SchedulerDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // strip time for clean comparisons

  // First day of the month (e.g. Saturday = 6 for March 2025)
  const firstDayOfMonth = new Date(year, month, 1);
  // How many blank cells to prepend (days from previous month)
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0=Sun … 6=Sat

  // Total days in this month (e.g. 31 for March)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: SchedulerDay[] = [];

  // ── Pad with "previous month" overflow days ──
  // These are just visual fillers — isCurrentMonth=false, not interactive
  const prevMonthDays = new Date(year, month, 0).getDate(); // days in prev month
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i);
    cells.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isPast: true,
      isWorkingDay: false,
      isLeaveDay: false,
      isSelected: false,
    });
  }

  // ── Current month days ──
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    date.setHours(0, 0, 0, 0);

    const dateStr = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const isPast = date < today;
    const dayOfWeek = date.getDay();
    const isWorkingDay = workingDays.includes(dayOfWeek);

    // Check if doctor has a FULL_DAY leave on this date
    const isLeaveDay = leaves.some((leave) => {
      const leaveDateStr = leave.leaveDate.toISOString().split("T")[0];
      return leaveDateStr === dateStr && leave.leaveType === "FULL_DAY";
    });

    // Check if this day matches the currently selected date
    const isSelected =
      selectedDate !== null &&
      selectedDate.toISOString().split("T")[0] === dateStr;

    cells.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
      isPast,
      isWorkingDay,
      isLeaveDay,
      isSelected,
    });
  }

  // ── Pad with "next month" overflow days until we have 42 cells ──
  let nextMonthDay = 1;
  while (cells.length < 42) {
    const date = new Date(year, month + 1, nextMonthDay++);
    cells.push({
      date,
      isCurrentMonth: false,
      isToday: false,
      isPast: false,
      isWorkingDay: false,
      isLeaveDay: false,
      isSelected: false,
    });
  }

  return cells;
}
