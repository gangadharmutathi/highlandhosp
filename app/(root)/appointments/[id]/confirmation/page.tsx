// app/(root)/appointments/[id]/confirmation/page.tsx
//
// Step 4 of the booking flow — Appointment Confirmation.
//
// Fetches the appointment from the database using the appointmentId
// from the URL and displays a full summary to the patient.
//
// The "Pay with PayPal" section is kept for future use but non-functional.
// The primary CTA is "Go to Home Page".

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  CalendarDays,
  Clock,
  User,
  Phone,
  FileText,
  Stethoscope,
  Home,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/db/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeDisplay(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Stepper shown at completed state (all 3 first steps done)
function BookingStepper() {
  return (
    <div className="flex items-center justify-center gap-0">
      {[1, 2, 3].map((n, i) => (
        <div key={n} className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-primary border-2 border-primary text-white">
            ✓
          </div>
          {i < 2 && <div className="w-16 h-0.5 mx-1 bg-primary" />}
        </div>
      ))}
      <div className="w-16 h-0.5 mx-1 bg-border-3" />
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 border-border-3 text-text-muted">
        4
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default async function ConfirmationPage({
  params,
}: ConfirmationPageProps) {
  const { id } = await params;

  // Fetch the appointment with doctor details
  const appointment = await prisma.appointment.findUnique({
    where: { appointmentId: id },
    include: {
      doctor: {
        select: {
          name: true,
          image: true,
          doctorProfile: {
            select: {
              specialty: true,
              consultationFee: true,
            },
          },
        },
      },
    },
  });

  if (!appointment) notFound();

  const doctor = appointment.doctor;

  const fee = doctor.doctorProfile?.consultationFee ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-body transition-colors mb-4"
        >
          Back to Doctor Profile
        </Link>

        {/* Stepper */}
        <div className="mb-6">
          <BookingStepper />
        </div>

        {/* Appointment Details */}
        <div className="bg-card border border-border-1 rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-text-title mb-3">
            Appointment Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Date &amp; Time:
              </span>
              <span className="font-medium text-text-body">
                {formatDateDisplay(appointment.appointmentStartUTC)} at{" "}
                {formatTimeDisplay(appointment.appointmentStartUTC)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Doctor:
              </span>
              <span className="font-medium text-text-body">{doctor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Specialty:</span>
              <span className="font-medium text-text-body">
                {doctor.doctorProfile?.specialty ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Visit Type:</span>
              <span className="font-medium text-text-body">
                {appointment.reasonForVisit}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-card border border-border-1 rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-text-title mb-3">
            Patient Information
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <User className="w-4 h-4" /> Name:
              </span>
              <span className="font-medium text-text-body">
                {appointment.patientName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone:
              </span>
              <span className="font-medium text-text-body">
                {appointment.phoneNumber}
              </span>
            </div>
            {appointment.patientRelation && (
              <div className="flex justify-between">
                <span className="text-text-muted">Relationship:</span>
                <span className="font-medium text-text-body">
                  {appointment.patientRelation}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        {appointment.additionalNotes && (
          <div className="bg-card border border-border-1 rounded-xl p-5 mb-4">
            <h2 className="font-semibold text-text-title mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Additional Notes
            </h2>
            <p className="text-sm text-text-body">
              {appointment.additionalNotes}
            </p>
          </div>
        )}

        {/* Payment Details — kept for future use, non-functional */}
        <div className="bg-card border border-border-1 rounded-xl p-5 mb-4">
          <h2 className="font-semibold text-text-title mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Payment Details
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Consultation Fee:</span>
              <span className="font-medium text-text-body">${fee}</span>
            </div>
            <div className="flex justify-between border-t border-border-1 pt-2 mt-2">
              <span className="font-semibold text-text-title">
                Total Amount Due:
              </span>
              <span className="font-semibold text-text-title">${fee}</span>
            </div>
          </div>

          {/* Payment method placeholder — non-functional */}
          <div className="mt-4">
            <p className="text-sm font-medium text-text-body mb-2">
              Select Payment Method
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-border-3 rounded-lg cursor-pointer">
                <input type="radio" name="payment" value="cash" readOnly />
                <span className="text-sm text-text-body">
                  Pay Cash at Counter
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-primary rounded-lg cursor-pointer bg-primary/5">
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  defaultChecked
                  readOnly
                />
                <span className="text-sm text-text-body">PayPal</span>
              </label>
            </div>
          </div>
        </div>

        {/* Reference number */}
        <p className="text-center text-xs text-text-muted mb-4">
          Booking Reference:{" "}
          <span className="font-mono font-medium text-text-body">{id}</span>
        </p>

        {/* CTA */}
        <Button variant="brand" className="w-full" asChild>
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Go to Home Page
          </Link>
        </Button>
      </div>
    </div>
  );
}
