// components/organisms/doctor-profile/about-doctor.tsx

import { DoctorDetails } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

type DoctorProfileAboutSectionProps = Pick<DoctorDetails, "name" | "brief">;

export default function DoctorProfileAboutSection({
  name,
  brief,
}: DoctorProfileAboutSectionProps) {
  if (!brief) return null;

  // Extract first name for the heading e.g. "Dr. Sarah Mitchell" -> "Dr. Mitchell"
  const lastName = name?.split(" ").slice(-1)[0] ?? "";
  const heading = `About Dr. ${lastName}`;

  return (
    <Card className="w-full overflow-hidden rounded-2xl border-0 bg-background shadow-sm p-4 md:p-6">
      <CardContent className="p-0">
        <h3 className="text-text-title mb-3">{heading}</h3>
        <p className="body-regular text-text-body-subtle">{brief}</p>
      </CardContent>
    </Card>
  );
}
