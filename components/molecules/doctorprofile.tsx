export interface DoctorProfileProps {
  doctorID: string;
  className?: string;
}

export default function DoctorProfile({
  doctorID,
  className,
}: DoctorProfileProps) {
  return (
    <div className={className}>
      <p className="text-card-foreground">Doctor ID: {doctorID}</p>
      {/* Profile content will be loaded from Supabase here */}
    </div>
  );
}
