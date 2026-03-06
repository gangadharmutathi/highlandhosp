import { DepartmentCard } from "@/components/molecules/departmentcard";
import { getDepartments } from "@/lib/actions/settings.actions";

export default async function DepartmentSections() {
  // 1. Fetch data directly using your Server Action
  const response = await getDepartments();

  // 2. Handle the error state or empty state
  if (!response.success || !response.data) {
    return (
      <section className="w-full bg-background-1 py-12">
        <p className="text-center text-red-500">
          {response.error || "Could not load departments."}
        </p>
      </section>
    );
  }

  const { departments } = response.data;

  return (
    <section className="w-full bg-background-1 py-12">
      <h2 className="text-text-title text-center mb-8 text-3xl font-bold">
        Our Departments
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 md:gap-6 max-w-7xl mx-auto">
        {departments.map((dept) => (
          <DepartmentCard
            key={dept.id}
            id={dept.id}
            title={dept.name}
            iconName={dept.iconName}
          />
        ))}
      </div>
    </section>
  );
}
