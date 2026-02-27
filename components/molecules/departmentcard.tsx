import { createElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getIconComponent } from "@/lib/utils";
import { HelpCircle } from "lucide-react";

interface DepartmentCardProps {
  id: string;
  title: string;
  iconName: string;
}

export function DepartmentCard({ title, iconName }: DepartmentCardProps) {
  const Icon = getIconComponent(iconName) ?? HelpCircle;
  return (
    <Card className="w-full min-w-0 max-w-[176px] flex flex-col bg-background-0 border border-border-2 items-center justify-center transition-all hover:shadow-md cursor-pointer group">
      <CardContent className="flex flex-col items-center justify-center gap-2 p-4">
        {/* Icon Container */}
        <div className="text-primary transition-transform group-hover:scale-110">
          {createElement(Icon, {
            size: 28,
            strokeWidth: 2,
            fill: "currentColor",
          })}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-text-title truncate w-full text-center">
          {title}
        </h3>
      </CardContent>
    </Card>
  );
}
