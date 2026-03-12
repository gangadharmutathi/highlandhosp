"use client";
// components/organisms/doctor-profile/scheduler-timeslots.tsx
//
// Displays available time slots for the selected date as a grid of buttons.
// The patient clicks one to select their preferred appointment time.
//
// This is a "dumb" UI component — it receives data as props and emits
// the selected slot back to the parent via a callback. No data fetching here.
//
// States this component handles:
//   • Loading  — parent is fetching slots (spinner shown)
//   • No date  — patient hasn't picked a date yet (placeholder message)
//   • No slots — date is selected but all slots are booked (message shown)
//   • Slots    — renders a grid of clickable time buttons

import { Loader2, Clock } from "lucide-react";
import { TimeSlot } from "@/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface SchedulerTimeslotsProps {
  /** Available slots returned by getAvailableSlots server action */
  slots: TimeSlot[];
  /** The label of the currently selected slot (e.g. "09:00"), or null */
  selectedSlot: TimeSlot | null;
  /** Called when the patient clicks a slot button */
  onSelectSlot: (slot: TimeSlot) => void;
  /** True while the parent is loading slots from the server */
  isLoading: boolean;
  /** True if the patient has already selected a date (controls placeholder text) */
  hasSelectedDate: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function SchedulerTimeslots({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
  hasSelectedDate,
}: SchedulerTimeslotsProps) {
  // ── Loading state ──
  // Show while the parent is calling getAvailableSlots after a date click
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading available times…</span>
      </div>
    );
  }

  // ── No date selected yet ──
  // Shown on initial load before the patient has clicked any calendar day
  if (!hasSelectedDate) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        Select a date to see available times
      </p>
    );
  }

  // ── No slots available ──
  // Date is selected but all slots are booked or blocked
  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-gray-400">
        <Clock className="w-5 h-5" />
        <p className="text-sm text-center">
          No available slots on this date.
          <br />
          Please choose a different day.
        </p>
      </div>
    );
  }

  // ── Slots grid ──
  // Renders available slots as a 2-column grid of buttons
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-2">
        {slots.length} slot{slots.length !== 1 ? "s" : ""} available
      </p>

      {/*
        2-column grid matching the design in the screenshot.
        Each button shows the slot label ("09:00") and is highlighted when selected.
      */}
      <div className="grid grid-cols-2 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.startUTC === slot.startUTC;

          return (
            <button
              key={slot.startUTC}
              onClick={() => onSelectSlot(slot)}
              aria-pressed={isSelected}
              aria-label={`Select ${slot.label}`}
              className={cn(
                // Base styles: full width, border, rounded, transition
                "w-full py-2 px-3 rounded-md border text-sm font-medium transition-colors",

                // Selected: filled blue to match brand color in screenshot
                isSelected
                  ? "bg-blue-600 text-white border-blue-600"
                  : // Unselected but available: white with grey border
                    "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600",
              )}
            >
              {slot.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
