"use client";
// components/organisms/booking/booking-form.tsx
//
// Step 3 of the booking flow — the patient details form.
//
// Handles:
//   - Myself / Someone Else toggle
//   - Form validation
//   - Submitting to createAppointment server action
//   - Navigating to confirmation page on success

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  FileText,
  ChevronDown,
  Loader2,
  AlertCircle,
  CalendarDays,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createAppointment } from "@/lib/actions/appointment.actions";
import { PatientType } from "@/db/generated/client";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const VISIT_REASONS = [
  "General Checkup",
  "Follow-up Visit",
  "New Symptom",
  "Chronic Condition Management",
  "Prescription Renewal",
  "Test Results Review",
  "Vaccination",
  "Second Opinion",
  "Other",
];

const RELATIONSHIPS = [
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Grandparent",
  "Grandchild",
  "Friend",
  "Other",
];

// ─────────────────────────────────────────────────────────────────────────────
// STEPPER
// ─────────────────────────────────────────────────────────────────────────────

function BookingStepper({ step }: { step: number }) {
  const steps = [
    { n: 1, label: "Select Doctor" },
    { n: 2, label: "Choose Slot" },
    { n: 3, label: "Patient Details" },
    { n: 4, label: "Review" },
  ];

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                s.n < step
                  ? "bg-primary border-primary text-white"
                  : s.n === step
                    ? "bg-primary border-primary text-white"
                    : "bg-background border-border-3 text-text-muted"
              }`}
            >
              {s.n < step ? "✓" : s.n}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-1 ${
                s.n < step ? "bg-primary" : "bg-border-3"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDateDisplay(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface BookingFormProps {
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string | null;
  consultationFee: number;
  selectedDate: string;
  startUTC: string;
  endUTC: string;
  slotLabel: string;
  prefillName: string;
  prefillPhone: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function BookingForm({
  doctorId,
  doctorName,
  doctorSpecialty,
  doctorImage,
  consultationFee,
  selectedDate,
  startUTC,
  endUTC,
  slotLabel,
  prefillName,
  prefillPhone,
}: BookingFormProps) {
  const router = useRouter();

  // ── Form state ──
  const [patientType, setPatientType] = useState<"MYSELF" | "SOMEONE_ELSE">(
    "MYSELF",
  );
  const [fullName, setFullName] = useState(prefillName);
  const [phone, setPhone] = useState(prefillPhone);
  const [useDifferentPhone, setUseDifferentPhone] = useState(false);
  const [differentPhone, setDifferentPhone] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Someone Else fields
  const [relationship, setRelationship] = useState("");
  const [patientFullName, setPatientFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [patientEmail, setPatientEmail] = useState("");

  // ── UI state ──
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ── Validation ──
  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (patientType === "MYSELF") {
      if (!fullName.trim()) errors.fullName = "Full name is required";
      const phoneToUse = useDifferentPhone ? differentPhone : phone;
      if (!phoneToUse.trim()) errors.phone = "Phone number is required";
      if (!reasonForVisit) errors.reasonForVisit = "Please select a reason";
    } else {
      if (!relationship) errors.relationship = "Please select a relationship";
      if (!patientFullName.trim())
        errors.patientFullName = "Patient name is required";
      const phoneToUse = useDifferentPhone ? differentPhone : phone;
      if (!phoneToUse.trim()) errors.phone = "Phone number is required";
      if (!reasonForVisit) errors.reasonForVisit = "Please select a reason";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!validate()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const phoneToUse = useDifferentPhone ? differentPhone : phone;
    const nameToUse = patientType === "MYSELF" ? fullName : patientFullName;

    const result = await createAppointment({
      doctorId,
      selectedDate,
      startUTC,
      endUTC,
      patientName: nameToUse,
      phoneNumber: phoneToUse,
      reasonForVisit,
      additionalNotes: additionalNotes || undefined,
      patientType: patientType as PatientType,
      patientRelation:
        patientType === "SOMEONE_ELSE" ? relationship : undefined,
    });

    setIsLoading(false);

    if (result.success && result.data) {
      router.push(`/appointments/${result.data.appointmentId}/confirmation`);
    } else {
      setErrorMessage(
        result.error ?? "Something went wrong. Please try again.",
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back link */}
        <Link
          href={`/doctors/${doctorId}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-body transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Doctor Profile
        </Link>

        {/* Selected appointment pill */}
        <div className="text-right text-xs text-text-muted mb-3">
          <span className="text-text-muted">Selected Appointment</span>
          <br />
          <span className="font-medium text-text-body text-sm">
            {formatDateDisplay(selectedDate)} at {slotLabel}
          </span>
        </div>

        {/* Doctor card */}
        <div className="flex items-center gap-3 bg-card border border-border-1 rounded-xl px-4 py-3 mb-5">
          {doctorImage ? (
            <Image
              src={doctorImage}
              alt={doctorName}
              width={48}
              height={48}
              className="rounded-full object-cover w-12 h-12"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          )}
          <div>
            <p className="font-semibold text-text-title">{doctorName}</p>
            <p className="text-sm text-text-muted">{doctorSpecialty}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-text-muted">Consultation Fee</p>
            <p className="font-semibold text-text-title">${consultationFee}</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-6">
          <BookingStepper step={3} />
        </div>

        {/* Form card */}
        <div className="bg-card border border-border-1 rounded-xl p-5 space-y-5">
          {/* Who is this for toggle */}
          <div>
            <p className="font-semibold text-text-title mb-3">
              Who is this appointment for?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPatientType("MYSELF")}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  patientType === "MYSELF"
                    ? "bg-primary text-white border-primary"
                    : "bg-background border-border-3 text-text-body hover:border-primary/50"
                }`}
              >
                Myself
              </button>
              <button
                type="button"
                onClick={() => setPatientType("SOMEONE_ELSE")}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  patientType === "SOMEONE_ELSE"
                    ? "bg-primary text-white border-primary"
                    : "bg-background border-border-3 text-text-body hover:border-primary/50"
                }`}
              >
                Someone Else
              </button>
            </div>
          </div>

          {/* ── MYSELF fields ── */}
          {patientType === "MYSELF" && (
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className={fieldErrors.fullName ? "border-red-400" : ""}
                  />
                  {prefillName && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
                {prefillName && (
                  <p className="text-xs text-text-muted">
                    To update your name please visit your profile.
                  </p>
                )}
                {fieldErrors.fullName && (
                  <p className="text-xs text-red-500">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Email — display only if pre-filled */}
              {/* Primary Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone">Primary Phone Number</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    disabled={!useDifferentPhone && !!prefillPhone}
                    className={fieldErrors.phone ? "border-red-400" : ""}
                  />
                  {prefillPhone && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
                {prefillPhone && (
                  <p className="text-xs text-text-muted">
                    This is your profile phone number. To update it, please
                    visit your profile settings.
                  </p>
                )}
                {fieldErrors.phone && !useDifferentPhone && (
                  <p className="text-xs text-red-500">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Use different phone checkbox */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="differentPhone"
                  checked={useDifferentPhone}
                  onCheckedChange={(v) => setUseDifferentPhone(!!v)}
                />
                <label
                  htmlFor="differentPhone"
                  className="text-sm text-text-body cursor-pointer"
                >
                  Use a different phone number for this appointment
                </label>
              </div>

              {useDifferentPhone && (
                <div className="space-y-1.5">
                  <Label htmlFor="differentPhone-input">
                    Phone Number for this Appointment
                  </Label>
                  <Input
                    id="differentPhone-input"
                    value={differentPhone}
                    onChange={(e) => setDifferentPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={fieldErrors.phone ? "border-red-400" : ""}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500">{fieldErrors.phone}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── SOMEONE ELSE fields ── */}
          {patientType === "SOMEONE_ELSE" && (
            <div className="space-y-4">
              {/* Relationship */}
              <div className="space-y-1.5">
                <Label>Relationship to Patient</Label>
                <Select value={relationship} onValueChange={setRelationship}>
                  <SelectTrigger
                    className={fieldErrors.relationship ? "border-red-400" : ""}
                  >
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.relationship && (
                  <p className="text-xs text-red-500">
                    {fieldErrors.relationship}
                  </p>
                )}
              </div>

              {/* Patient Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="patientFullName">Full Name of Patient</Label>
                <Input
                  id="patientFullName"
                  value={patientFullName}
                  onChange={(e) => setPatientFullName(e.target.value)}
                  placeholder="Patient's full name"
                  className={
                    fieldErrors.patientFullName ? "border-red-400" : ""
                  }
                />
                {fieldErrors.patientFullName && (
                  <p className="text-xs text-red-500">
                    {fieldErrors.patientFullName}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <Label htmlFor="dob">Date of Birth of Patient</Label>
                <Input
                  id="dob"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  placeholder="DD/MM/YYYY"
                />
                <p className="text-xs text-text-muted">
                  Please enter date in DD/MM/YYYY format.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="patientEmail">Email Address</Label>
                <Input
                  id="patientEmail"
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  disabled={!!prefillPhone}
                  className="bg-muted/30"
                />
              </div>

              {/* Primary Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phoneElse">Primary Phone Number</Label>
                <div className="relative">
                  <Input
                    id="phoneElse"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    disabled={!useDifferentPhone && !!prefillPhone}
                    className={fieldErrors.phone ? "border-red-400" : ""}
                  />
                  {prefillPhone && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
                {prefillPhone && (
                  <p className="text-xs text-text-muted">
                    This is your profile phone number. To update it, please
                    visit your profile settings.
                  </p>
                )}
                {fieldErrors.phone && !useDifferentPhone && (
                  <p className="text-xs text-red-500">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Use different phone */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="differentPhoneElse"
                  checked={useDifferentPhone}
                  onCheckedChange={(v) => setUseDifferentPhone(!!v)}
                />
                <label
                  htmlFor="differentPhoneElse"
                  className="text-sm text-text-body cursor-pointer"
                >
                  Use a different phone number for this appointment
                </label>
              </div>

              {useDifferentPhone && (
                <div className="space-y-1.5">
                  <Label htmlFor="diffPhoneElse">
                    Phone Number for this Appointment
                  </Label>
                  <Input
                    id="diffPhoneElse"
                    value={differentPhone}
                    onChange={(e) => setDifferentPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={fieldErrors.phone ? "border-red-400" : ""}
                  />
                  {fieldErrors.phone && (
                    <p className="text-xs text-red-500">{fieldErrors.phone}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Shared fields (both modes) ── */}
          <div className="space-y-4">
            {/* Reason for Visit */}
            <div className="space-y-1.5">
              <Label>Reason for Visit</Label>
              <Select value={reasonForVisit} onValueChange={setReasonForVisit}>
                <SelectTrigger
                  className={fieldErrors.reasonForVisit ? "border-red-400" : ""}
                >
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {VISIT_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.reasonForVisit && (
                <p className="text-xs text-red-500">
                  {fieldErrors.reasonForVisit}
                </p>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Add any additional information about your visit"
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking…
                </span>
              ) : (
                "Continue to Book"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
