import DoctorProfile from "@/components/molecules/doctorprofile";

interface DoctorPageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorPage({ params }: DoctorPageProps) {
  const { id } = await params;
  return (
    <div className="min-h-screen py-10 px-4">
      <DoctorProfile doctorID={id} />
    </div>
  );
}
