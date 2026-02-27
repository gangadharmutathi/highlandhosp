import { DepartmentCard } from "@/components/molecules/departmentcard";
import { departmentData } from "@/db/dummydata";

export default function DepartmentSections() {
  return (
    <section className="w-full bg-background-1">
      <h2 className="text-text-title text-center mb-8">Our Departments</h2>
      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(176px,1fr))] gap-6 md:gap-8">
        {departmentData.map((dept) => (
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
